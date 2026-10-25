const rules = [
  {
    type: "input",
    field: "bridgeUrl" as const,
    title: "桥接服务地址",
    value: "http://127.0.0.1:8790",
    props: { placeholder: "先启动 customProviders/codexBridge 桥接服务" },
  },
  {
    type: "inputNumber",
    field: "timeoutMinutes" as const,
    title: "生成超时（分钟）",
    value: 12,
    props: { min: 1, max: 30 },
  },
] as const;

const version = "1.0.0";

const readme = `通过本机 codex CLI（ChatGPT 账号登录，image_generation feature）生成图片。codex 无法被 Toonflow 供应商直接调用，需先启动本地桥接服务：

bun customProviders/codexBridge/server.ts

前置：codex login 登录 ChatGPT 账号；如需代理，桥接启动参数加 --proxy。单张出图约 2-4 分钟，建议单人使用；请勿把桥接服务暴露到公网。`;

type mediaInput =
  | { type: "url"; url: string; mimeType?: string; name?: string }
  | { type: "base64"; data: string; mimeType: string; name?: string }
  | { type: "binary"; data: Uint8Array; mimeType: string; name?: string };

// 桥接端按容差匹配 1:1/16:9/9:16/4:3/3:4；比例换算成代表尺寸透传，其余原样。
const ratioSizes: Record<string, string> = {
  "1:1": "1024x1024",
  "16:9": "1920x1080",
  "9:16": "1080x1920",
  "4:3": "1024x768",
  "3:4": "768x1024",
};

function toDataUrl(input: mediaInput) {
  if (input.type === "url") return input.url;
  const base64 = input.type === "base64" ? input.data.replace(/^data:[^;]+;base64,/, "") : Buffer.from(input.data).toString("base64");
  return `data:${input.mimeType};base64,${base64}`;
}

export default {
  id: "codexImage",
  label: "Codex 图片生成",
  version,
  readme,
  rules,
  models: [
    {
      id: "codex-image",
      label: "Codex 图片生成",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
  ],
  async generateImage(request: { prompt: string; images?: mediaInput[]; size?: string; ratio?: string }) {
    const bridgeUrl = String(this.config.bridgeUrl ?? "")
      .trim()
      .replace(/\/+$/, "");
    if (!bridgeUrl) throw new Error("请填写桥接服务地址");
    const timeoutMinutes = Number(this.config.timeoutMinutes);
    // 供应商超时须大于桥接默认超时（10 分钟）加排队余量，避免桥接还在跑时供应商先断开。
    const signal = AbortSignal.any([
      AbortSignal.timeout((Number.isFinite(timeoutMinutes) && timeoutMinutes > 0 ? timeoutMinutes : 12) * 60_000),
      ...(this.signal ? [this.signal] : []),
    ]);

    const body: Record<string, unknown> = { prompt: request.prompt };
    const refs = (request.images ?? []).map(toDataUrl);
    if (refs.length > 0) body.refs = refs;
    const size = request.size?.trim() || ratioSizes[request.ratio ?? ""];
    if (size) body.size = size;

    let response;
    try {
      response = await this.tool.fetch(`${bridgeUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new Error(`桥接服务无法连接（${bridgeUrl}），请先运行 bun customProviders/codexBridge/server.ts`);
    }
    const text = await response.text();
    let data: { image?: string; error?: string };
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`桥接服务响应异常（HTTP ${response.status}）：${text.slice(0, 200)}`);
    }
    if (!response.ok) throw new Error(data.error || `桥接服务请求失败（HTTP ${response.status}）`);
    const base64 = /^data:image\/png;base64,(.+)$/s.exec(data.image ?? "")?.[1];
    if (!base64) throw new Error("桥接服务未返回图片数据");
    return [{ mediaType: "image" as const, type: "base64" as const, data: base64, mimeType: "image/png" }];
  },
};
