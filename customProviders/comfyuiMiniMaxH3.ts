const rules = [
  {
    type: "input",
    field: "baseUrl" as const,
    title: "ComfyUI 服务地址",
    value: "http://127.0.0.1:8188",
    props: { placeholder: "例如 http://192.168.1.10:8188" },
  },
  {
    type: "input",
    field: "workflowT2v" as const,
    title: "t2v 工作流（文生视频）",
    value: "",
    props: { type: "textarea", rows: 6, placeholder: "在 ComfyUI 用 Save (API Format) 导出后粘贴 JSON" },
  },
  {
    type: "input",
    field: "workflowI2v" as const,
    title: "i2v 工作流（首帧图生视频）",
    value: "",
    props: { type: "textarea", rows: 6, placeholder: "在 ComfyUI 用 Save (API Format) 导出后粘贴 JSON" },
  },
  {
    type: "input",
    field: "workflowR2v" as const,
    title: "r2v 工作流（多参考图生视频）",
    value: "",
    props: { type: "textarea", rows: 6, placeholder: "在 ComfyUI 用 Save (API Format) 导出后粘贴 JSON" },
  },
  {
    type: "input",
    field: "clientId" as const,
    title: "client_id（可选）",
    value: "",
    props: { placeholder: "留空自动生成" },
  },
  {
    type: "inputNumber",
    field: "pollIntervalMs" as const,
    title: "轮询间隔（毫秒）",
    value: 5000,
    props: { min: 1000, max: 60000 },
  },
  {
    type: "inputNumber",
    field: "timeoutMinutes" as const,
    title: "生成超时（分钟）",
    value: 20,
    props: { min: 1, max: 60 },
  },
] as const;

const version = "1.0.0";

const readme = `通过远程 ComfyUI 的 MiniMax H3 节点生成视频，支持文生视频（t2v）、首帧图生视频（i2v）与多参考图生视频（r2v，最多 10 张）。

使用步骤：
1. 在 ComfyUI 中分别加载三种模式的工作流，用 Save (API Format) 导出 JSON，粘贴到对应配置项；
2. 工作流需包含 MiniMax H3 生成节点、ResolutionSelector 节点、标题含 Duration/时长的数值节点；i2v/r2v 需含 LoadImage 节点，输出需 SaveVideo 节点；
3. ComfyUI 服务地址须能被运行 Toonflow 的机器访问（提交、上传与取回视频走同一地址）。

分镜提示词可配合 MiniMax H3 官方提示词模板（h3PromptWriting 技能）使用。`;

// ResolutionSelector 的显示值映射；节点里没有 aspect_ratio 字段时不写入。
const aspectRatioValues: Record<string, string> = {
  "16:9": "16:9 (Widescreen)",
  "9:16": "9:16 (Portrait)",
  "1:1": "1:1 (Square)",
  "4:3": "4:3 (Standard)",
  "3:4": "3:4 (Portrait)",
  "3:2": "3:2 (Classic)",
  "2:3": "2:3 (Portrait)",
  "21:9": "21:9 (Ultrawide)",
};

// MiniMax H3 的 ResolutionSelector 用兆像素而不是 480p / 720p 字符串。
const resolutionMegapixels: Record<string, number> = { "480p": 0.4, "720p": 0.7, "1080p": 1.2 };

const genNodePattern = /MiniMaxH3ReferenceToVideo|MiniMaxH3ImageToVideo|MinimaxTextToVideoNode|MiniMaxHailuo|Hailuo.*(Video|Frame|Reference)/i;

type workflowNode = { class_type?: string; inputs?: Record<string, unknown>; _meta?: { title?: string } };
type workflow = Record<string, workflowNode>;
type mediaInput =
  | { type: "url"; url: string; mimeType?: string; name?: string }
  | { type: "base64"; data: string; mimeType: string; name?: string }
  | { type: "binary"; data: Uint8Array; mimeType: string; name?: string };
type providerContext = {
  config: Record<string, unknown>;
  signal?: AbortSignal;
  tool: {
    fetch: typeof globalThis.fetch;
    errorMessage(value: unknown): string;
  };
};

function wait(signal: AbortSignal, ms: number) {
  signal.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

function numberConfig(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function base64Payload(data: string) {
  const match = /^data:[^;]+;base64,(.*)$/s.exec(data);
  return match ? match[1] : data;
}

async function toBytes(context: providerContext, input: mediaInput): Promise<Uint8Array> {
  if (input.type === "base64") return Buffer.from(base64Payload(input.data), "base64");
  if (input.type === "binary") return input.data;
  const response = await context.tool.fetch(input.url);
  if (!response.ok) throw new Error(`获取参考图片失败：HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

function imageExtension(mimeType: string | undefined) {
  if (mimeType?.includes("jpeg")) return "jpg";
  if (mimeType?.includes("webp")) return "webp";
  return "png";
}

type multipartField = { name: string; filename?: string; mimeType?: string; value: string | Uint8Array };

// 沙箱内没有 FormData，手工构造 multipart 表单体。
function multipart(fields: multipartField[]) {
  const boundary = "----Toonflow" + Date.now().toString(36) + Math.random().toString(36).slice(2);
  const chunks: Buffer[] = [];
  for (const field of fields) {
    let head = `--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"`;
    if (field.filename != null) {
      const safe = field.filename.replace(/[\r\n"\\]/g, "_");
      head += `; filename="${safe}"`;
    }
    if (field.mimeType) head += `\r\nContent-Type: ${field.mimeType}`;
    head += "\r\n\r\n";
    chunks.push(
      Buffer.from(head, "utf8"),
      Buffer.from(typeof field.value === "string" ? field.value : field.value),
      Buffer.from("\r\n", "utf8"),
    );
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`, "utf8"));
  return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}

async function uploadImage(context: providerContext, base: string, bytes: Uint8Array, filename: string, mimeType: string) {
  const { body, contentType } = multipart([
    { name: "image", filename, mimeType, value: bytes },
    { name: "overwrite", value: "true" },
  ]);
  const response = await context.tool.fetch(`${base}/upload/image`, { method: "POST", headers: { "Content-Type": contentType }, body });
  if (!response.ok) throw new Error(`上传图片失败：HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
  const data = await response.json() as { name?: string };
  if (!data?.name) throw new Error("ComfyUI 上传图片未返回文件名");
  return data.name;
}

function parseWorkflow(source: unknown, title: string): workflow {
  const text = String(source ?? "").trim();
  if (!text) throw new Error(`请在供应商设置中粘贴${title}的 API 格式工作流 JSON`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`${title}工作流 JSON 解析失败，请重新导出粘贴`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !Object.values(parsed).some(value => value && typeof value === "object" && "class_type" in value)) {
    throw new Error(`${title}工作流不是 API 格式（顶层应为 {节点id: {class_type, inputs}}）；请在 ComfyUI 勾选开发者模式后用 Save (API Format) 导出`);
  }
  return JSON.parse(JSON.stringify(parsed)) as workflow;
}

function findGenNode(workflow: workflow) {
  for (const [id, node] of Object.entries(workflow)) {
    if (node && typeof node.class_type === "string" && genNodePattern.test(node.class_type)) return { id, node };
  }
  throw new Error("工作流中未找到 MiniMax H3 生成节点（MiniMaxH3ImageToVideo / MiniMaxH3ReferenceToVideo 等）");
}

function patchPrompt(workflow: workflow, prompt: string) {
  const { node } = findGenNode(workflow);
  const inputs = node.inputs ?? (node.inputs = {});
  if (inputs.prompt_text != null) inputs.prompt_text = prompt;
  else inputs.prompt = prompt;
}

function patchFirstFrame(workflow: workflow, imageName: string) {
  for (const node of Object.values(workflow)) {
    if (node?.class_type === "LoadImage") {
      node.inputs ?? (node.inputs = {});
      node.inputs.image = imageName;
      return;
    }
  }
  throw new Error("i2v 工作流中未找到 LoadImage 节点，无法写入首帧图");
}

function patchRefImages(workflow: workflow, names: string[]) {
  const { id: genId, node } = findGenNode(workflow);
  const inputs = node.inputs ?? (node.inputs = {});
  let prefix = "ref_image_";
  for (const key of Object.keys(inputs)) {
    if (/ref_image_0$/.test(key)) {
      prefix = key.slice(0, -1);
      break;
    }
  }
  const loadIds = Object.entries(workflow)
    .filter(([, node]) => node?.class_type === "LoadImage")
    .map(([id]) => Number(id))
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  let maxId = loadIds.length ? loadIds[loadIds.length - 1]! : 0;
  for (let index = 0; index < names.length; index++) {
    let loadId = loadIds[index];
    if (loadId == null) {
      maxId += 1;
      loadId = maxId;
      workflow[String(loadId)] = { class_type: "LoadImage", inputs: {} };
    }
    workflow[String(loadId)]!.inputs!.image = names[index]!;
    inputs[`${prefix}${index}`] = [String(loadId), 0];
  }
  for (let index = names.length; inputs[`${prefix}${index}`] != null; index++) delete inputs[`${prefix}${index}`];
}

function patchOptions(workflow: workflow, ratio: string, resolution: string, duration: number) {
  const resolutionNode = Object.values(workflow).find(
    node => node?.class_type === "ResolutionSelector" || (node.inputs?.megapixels != null && node.inputs?.aspect_ratio != null),
  );
  if (!resolutionNode) throw new Error("工作流中未找到 ResolutionSelector（或含 megapixels/aspect_ratio 输入）的分辨率节点");
  resolutionNode.inputs ?? (resolutionNode.inputs = {});
  resolutionNode.inputs.megapixels = resolutionMegapixels[String(resolution).toLowerCase()] ?? resolutionMegapixels["480p"]!;
  if ("aspect_ratio" in resolutionNode.inputs) {
    resolutionNode.inputs.aspect_ratio = aspectRatioValues[ratio] ?? aspectRatioValues["16:9"]!;
  }
  const durationNode = Object.values(workflow).find(
    node => node.inputs?.value != null && /duration|时长/i.test(String(node._meta?.title ?? "")),
  );
  if (!durationNode) throw new Error("工作流中未找到标题含 Duration/时长 且带 value 输入的时长节点");
  durationNode.inputs!.value = duration > 0 ? duration : 5;
}

// ComfyUI 提交失败时的 node_errors 结构不在通用 errorMessage 的提取范围内，单独拼可读信息。
function promptError(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  const record = data as { error?: { message?: string; type?: string }; node_errors?: Record<string, { errors?: { message?: string; details?: string }[] }> };
  const parts: string[] = [];
  if (record.error?.message) parts.push(record.error.type ? `${record.error.message}（${record.error.type}）` : record.error.message);
  for (const [id, node] of Object.entries(record.node_errors ?? {})) {
    for (const error of node.errors ?? []) parts.push(`节点 ${id}: ${error.message ?? ""}${error.details ? ` (${error.details.slice(0, 120)})` : ""}`);
  }
  return parts.length ? parts.join("；").slice(0, 500) : fallback;
}

async function submitPrompt(context: providerContext, base: string, workflow: workflow, clientId: string, signal: AbortSignal) {
  const response = await context.tool.fetch(`${base}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: clientId }),
    signal,
  });
  const text = await response.text();
  if (!response.ok) {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {}
    throw new Error(`ComfyUI 提交失败（HTTP ${response.status}）：${promptError(parsed, text.slice(0, 300))}`);
  }
  let data: { prompt_id?: string; data?: { prompt_id?: string } };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`ComfyUI /prompt 响应非 JSON：${text.slice(0, 200)}`);
  }
  const promptId = data.prompt_id ?? data.data?.prompt_id;
  if (!promptId) throw new Error(`ComfyUI 未返回 prompt_id：${text.slice(0, 200)}`);
  return promptId;
}

type historyEntry = {
  status?: { status_str?: string; completed?: boolean; messages?: unknown[] };
  outputs?: Record<string, { videos?: { filename: string; subfolder?: string; type?: string }[]; gifs?: { filename: string; subfolder?: string; type?: string }[]; images?: { filename: string; subfolder?: string; type?: string }[] }>;
};

async function pollResult(context: providerContext, base: string, promptId: string, signal: AbortSignal, intervalMs: number) {
  while (true) {
    await wait(signal, intervalMs);
    let entry: historyEntry | undefined;
    try {
      const response = await context.tool.fetch(`${base}/history/${encodeURIComponent(promptId)}`, { signal });
      if (!response.ok) continue;
      const history = await response.json() as Record<string, historyEntry>;
      entry = history?.[promptId];
    } catch (error) {
      if (signal.aborted) throw error;
      continue;
    }
    if (!entry) continue;
    const status = entry.status;
    if (status?.status_str?.toLowerCase() === "error") {
      const message = status.messages?.map(item => (Array.isArray(item) ? item.join(": ") : String(item))).join("; ") ?? "";
      throw new Error(`ComfyUI 执行失败：${message.slice(0, 300) || "未知错误"}`);
    }
    if (status?.completed) {
      for (const output of Object.values(entry.outputs ?? {})) {
        const file = output?.videos?.[0] ?? output?.gifs?.[0] ?? output?.images?.[0];
        if (file) {
          const query = new URLSearchParams({ filename: file.filename, subfolder: file.subfolder ?? "", type: file.type ?? "output" });
          return `${base}/view?${query.toString()}`;
        }
      }
      throw new Error("ComfyUI 任务完成但未找到输出视频；请确认工作流包含 SaveVideo 节点");
    }
  }
}

export default {
  id: "comfyuiMiniMaxH3",
  label: "ComfyUI MiniMax H3",
  version,
  readme,
  rules,
  models: [
    {
      id: "MiniMax-H3",
      label: "MiniMax H3 (ComfyUI)",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:10"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p", "1080p"] }],
    },
  ],
  async generateVideo(request: {
    prompt: string;
    images?: mediaInput[];
    videos?: mediaInput[];
    audios?: mediaInput[];
    firstFrame?: mediaInput;
    lastFrame?: mediaInput;
    duration?: number;
    ratio?: string;
    resolution?: string;
  }) {
    const base = String(this.config.baseUrl ?? "").trim().replace(/\/+$/, "");
    if (!base) throw new Error("请填写 ComfyUI 服务地址");
    if (request.audios?.length) throw new Error("ComfyUI MiniMax H3 工作流不支持音频参考输入，请移除音频素材");
    if (request.videos?.length) throw new Error("ComfyUI MiniMax H3 工作流不支持视频参考输入，请移除视频素材");
    if (request.lastFrame) throw new Error("当前工作流不支持尾帧输入（FL2VA），请移除尾帧");

    const references = (request.images ?? []).slice(0, 10);
    const hasFirstFrame = !!request.firstFrame;
    const mode = references.length > 0 ? "r2v" : hasFirstFrame ? "i2v" : "t2v";
    const workflow = parseWorkflow(
      mode === "r2v" ? this.config.workflowR2v : mode === "i2v" ? this.config.workflowI2v : this.config.workflowT2v,
      mode === "r2v" ? "r2v" : mode === "i2v" ? "i2v" : "t2v",
    );

    const timeoutMinutes = numberConfig(this.config.timeoutMinutes, 20);
    const intervalMs = numberConfig(this.config.pollIntervalMs, 5000);
    // 远程 ComfyUI 有排队，单条生成数分钟属常态；超时上限与轮询间隔都允许配置。
    const signal = AbortSignal.any([AbortSignal.timeout(timeoutMinutes * 60_000), ...(this.signal ? [this.signal] : [])]);
    const stamp = Date.now().toString(36);
    const context: providerContext = this as providerContext;

    patchPrompt(workflow, request.prompt.trim());
    patchOptions(workflow, request.ratio || "16:9", String(request.resolution ?? ""), Number(request.duration ?? 0));
    if (mode === "i2v") {
      const bytes = await toBytes(context, request.firstFrame!);
      const name = await uploadImage(context, base, bytes, `toonflow_firstframe_${stamp}.png`, "image/png");
      patchFirstFrame(workflow, name);
    } else if (mode === "r2v") {
      const inputs = [...(hasFirstFrame ? [request.firstFrame!] : []), ...references];
      const names: string[] = [];
      for (const [index, input] of inputs.entries()) {
        const bytes = await toBytes(context, input);
        names.push(await uploadImage(context, base, bytes, `toonflow_ref_${stamp}_${index}.${imageExtension(input.mimeType)}`, input.mimeType));
      }
      patchRefImages(workflow, names);
    }

    const clientId = String(this.config.clientId ?? "").trim() || `toonflow-${stamp}`;
    const promptId = await submitPrompt(context, base, workflow, clientId, signal);
    const videoUrl = await pollResult(context, base, promptId, signal, intervalMs);
    return [{ mediaType: "video" as const, type: "url" as const, url: videoUrl }];
  },
};
