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

const languageMap: Record<string, string> = {
  "zh-CN": "chinese",
  zh: "chinese",
  "en-US": "english",
  en: "english",
  "ja-JP": "japanese",
  ja: "japanese",
  "ko-KR": "korean",
  ko: "korean",
  "es-ES": "spanish",
  es: "spanish",
  "fr-FR": "french",
  fr: "french",
  "pt-PT": "portuguese",
  pt: "portuguese",
  "ru-RU": "russian",
  ru: "russian",
};

const voicePrefixRegex = /^(?:voice\s*direction\b|voice\b|音色(?:设计)?|声线(?:设计)?|声音(?:描述)?|角色音色)\s*[-—:：]?\s*/i;
const dialoguePrefixRegex = /^(?:dialogue\b|text\b|script\b|台词|正文|待朗读(?:文本)?|文本|内容)\s*[-—:：]?\s*/i;
const roleTagRegex = /^[—\-\s]*[^\n，。,.]+\s*[/／]\s*[^\n，。,.]+[\.。;；,，\s]*/;

function cleanVoiceText(text: string): string {
  return text
    .replace(voicePrefixRegex, "")
    .replace(roleTagRegex, "")
    .replace(/仅指导已有发声[，,。.]*不新增台词[，,。.]*/g, "")
    .trim();
}

function cleanDialogueText(text: string): string {
  return text.replace(dialoguePrefixRegex, "").trim();
}

function parseMixedBlock(blockText: string): { voice: string; dialogue: string } {
  const lines = blockText.split("\n");
  const voiceLines: string[] = [];
  const textLines: string[] = [];
  let currentMode: "voice" | "dialogue" | "unknown" = "unknown";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (voicePrefixRegex.test(trimmed)) {
      currentMode = "voice";
      voiceLines.push(cleanVoiceText(trimmed));
    } else if (dialoguePrefixRegex.test(trimmed)) {
      currentMode = "dialogue";
      textLines.push(cleanDialogueText(trimmed));
    } else {
      if (currentMode === "voice") voiceLines.push(trimmed);
      else if (currentMode === "dialogue") textLines.push(trimmed);
      else textLines.push(trimmed);
    }
  }
  return {
    voice: voiceLines.join("\n").trim(),
    dialogue: textLines.join("\n").trim(),
  };
}

/**
 * 支持同时从节点输入框及连线参考文本中提取声线设计描述与台词。
 * 1. 输入框支持同时输入「音色：...」与「台词：...」；
 * 2. 连线参考块支持中文/英文声线前缀自动识别并自动剥离前缀噪点；
 * 3. 连线参考块若未写前缀但包含声线特征词，自动识别为声线指令。
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

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const hasVoiceLine = lines.some(l => voicePrefixRegex.test(l));
    const hasDialogueLine = lines.some(l => dialoguePrefixRegex.test(l));

    if (hasVoiceLine || hasDialogueLine) {
      const parsed = parseMixedBlock(text);
      if (parsed.voice) voiceBlocks.push(parsed.voice);
      if (parsed.dialogue) textBlocks.push(parsed.dialogue);
    } else {
      if (index > 0 && voiceBlocks.length === 0 && /(?:男声|女声|音色|声线|音调|语速|嗓音|口音|萝莉|大叔|少女|老爷爷|老妇|正太)/.test(text)) {
        voiceBlocks.push(cleanVoiceText(text));
      } else {
        textBlocks.push(text);
      }
    }
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

用法：
1. 单节点直接输入：在音频生成节点的输入框中，按如下格式输入：
   音色：体现撒娇稚嫩的萝莉女声，音调偏高且起伏明显。
   台词：哥哥，你回来啦！
2. 连线输入：主输入框写台词，连入一个写有声线描述的文本节点（支持「音色：...」、「声线：...」或英文「VOICE DIRECTION: ...」，会自动识别并清洗前缀）。

前置：oMLX 已加载 Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit。`,
  rules,
  models: [
    {
      id: "Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit",
      label: "Qwen3-TTS VoiceDesign（文字设计音色）",
      type: "audio",
    },
  ],
  async generateAudio(request: { prompt?: string; text?: string; speed?: number; format?: string; language?: string }) {
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
    const targetLanguage = request.language ? (languageMap[request.language] ?? request.language.toLowerCase()) : undefined;
    if (targetLanguage) body.language = targetLanguage;
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
