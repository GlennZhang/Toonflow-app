const rules = [
  {
    type: "input",
    field: "baseUrl" as const,
    title: "oMLX 服务地址",
    value: "http://127.0.0.1:8989/v1",
    props: { placeholder: "oMLX OpenAI 兼容地址，含 /v1" },
  },
  {
    type: "input",
    field: "apiKey" as const,
    title: "API Key",
    value: "noapikey",
    props: { placeholder: "oMLX 未设置鉴权时填 noapikey" },
  },
  {
    type: "inputNumber",
    field: "timeoutMinutes" as const,
    title: "生成超时（分钟）",
    value: 5,
    props: { min: 1, max: 30 },
  },
] as const;

const version = "1.0.0";

const voiceModelId = "Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit";

const formatMime: Record<string, string> = {
  wav: "audio/wav",
  mp3: "audio/mpeg",
  pcm: "audio/pcm",
  flac: "audio/flac",
  opus: "audio/ogg",
};

/**
 * 画布会把连接的文本参考按「参考 N：\n<内容>」拼进 prompt。
 * 这里按该约定拆分：以 VOICE DIRECTION 开头的参考块作为声线描述（instructions），
 * 其余文本（主输入框与普通文本参考）作为待朗读内容（input）。
 */
function splitPrompt(prompt: string): { input: string; instructions?: string } {
  const marker = /^参考\s*\d+\s*[：:]\s*$/;
  const blocks: string[][] = [[]];
  for (const line of prompt.split("\n")) {
    if (marker.test(line.trim())) blocks.push([]);
    else blocks[blocks.length - 1].push(line);
  }
  const voiceBlocks: string[] = [];
  const textBlocks: string[] = [];
  blocks.forEach((block, index) => {
    const text = block.join("\n").trim();
    if (!text) return;
    // 主输入框（首块）只可能是台词；参考块按开头标记识别声线描述
    if (index > 0 && /^\s*voice\s*direction\b/i.test(text)) voiceBlocks.push(text);
    else textBlocks.push(text);
  });
  return {
    input: textBlocks.join("\n").trim(),
    instructions: voiceBlocks.length ? voiceBlocks.join("\n") : undefined,
  };
}

export default {
  id: "qwenTts",
  label: "Qwen3-TTS 语音设计（oMLX）",
  version,
  readme: `本地 oMLX（OpenAI 兼容服务，默认 http://127.0.0.1:8989/v1）上的 Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit，按文字描述设计角色声线并朗读台词。

用法：画布添加「音频生成」节点并选择本模型；台词写在节点输入框（或连接台词文本节点），声线描述文本节点（以 VOICE DIRECTION 开头）直接连入即可，会自动识别为声线指令而不会被读出来。未连接声线文本时使用模型默认音色。

前置：oMLX 已加载 Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit。`,
  rules,
  models: [
    {
      id: "Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit",
      label: "Qwen3-TTS VoiceDesign（文字设计音色）",
      type: "audio",
    },
  ],
  async generateAudio(request: { prompt?: string; text?: string; speed?: number; format?: string }) {
    const baseUrl = String(this.config.baseUrl ?? "")
      .trim()
      .replace(/\/+$/, "");
    if (!baseUrl) throw new Error("请填写 oMLX 服务地址");
    const apiKey = String(this.config.apiKey ?? "").trim() || "noapikey";
    const timeoutMinutes = Number(this.config.timeoutMinutes);
    const signal = AbortSignal.any([
      AbortSignal.timeout((Number.isFinite(timeoutMinutes) && timeoutMinutes > 0 ? timeoutMinutes : 5) * 60_000),
      ...(this.signal ? [this.signal] : []),
    ]);

    const { input, instructions } = splitPrompt(String(request.text ?? request.prompt ?? ""));
    if (!input) throw new Error("请输入待朗读台词（声线描述不能单独生成语音）");

    const format = request.format ?? "wav";
    const mimeType = formatMime[format];
    if (!mimeType) throw new Error(`不支持的音频格式：${format}（支持 ${Object.keys(formatMime).join("、")}）`);

    const body: Record<string, unknown> = { model: voiceModelId, input, response_format: format };
    if (instructions) body.instructions = instructions;
    if (typeof request.speed === "number" && Number.isFinite(request.speed)) {
      if (request.speed < 0.5 || request.speed > 2) throw new Error("语速倍率须在 0.5 到 2 之间");
      body.speed = request.speed;
    }

    let response;
    try {
      response = await this.tool.fetch(`${baseUrl}/audio/speech`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new Error(`oMLX 服务无法连接（${baseUrl}），请确认 oMLX 已启动`);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`语音生成失败（HTTP ${response.status}）：${text.slice(0, 300)}`);
    }
    const data = new Uint8Array(await response.arrayBuffer());
    if (data.length === 0) throw new Error("oMLX 未返回音频数据");
    return [{ mediaType: "audio" as const, type: "binary" as const, data, mimeType }];
  },
};
