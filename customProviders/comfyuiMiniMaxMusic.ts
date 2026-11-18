const rules = [
  {
    type: "input",
    field: "baseUrl" as const,
    title: "ComfyUI 服务地址",
    value: "http://127.0.0.1:8188",
    props: { placeholder: "例如 http://127.0.0.1:8188" },
  },
  {
    type: "input",
    field: "workflow" as const,
    title: "MiniMax Music 3.0 工作流 JSON",
    value: `{"35": {"inputs": {"filename_prefix": "audio/audio_minimax_music3", "format": "mp3", "format.quality": "V0", "audio": ["37:43", 0]}, "class_type": "SaveAudioAdvanced", "_meta": {"title": "\\u4fdd\\u5b58\\u97f3\\u9891\\uff08\\u9ad8\\u7ea7\\uff09", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:6": {"inputs": {"unet_name": "minimax_music3_dit_fp16.safetensors", "weight_dtype": "default"}, "class_type": "UNETLoader", "_meta": {"title": "UNet\\u52a0\\u8f7d\\u5668", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:13": {"inputs": {"caption": "Global Metadata: Lo-fi hip-hop, chillhop. 78 BPM, D flat major, major scale with jazzy extensions. Laid-back and dreamy throughout, a gentle warm drift with a subtle late-night glow that deepens in the middle and dissolves softly at the end. Studying, raining-outside, headphones-on late-night listening. Bedroom production: muddy warm texture, heavy vinyl crackle, tape hiss and wow-flutter pitch wobble, low-passed dusty mix, soft-clipped drums, everything slightly detuned and cozy.\\n\\nVocal Details: Soft androgynous vocal, hushed half-sung half-spoken delivery, sitting low in the mix like another instrument, lazy behind-the-beat phrasing, gentle breathy timbre. Sparse murmured double-tracked harmonies, occasional wordless \\"mmm\\" and \\"ooh\\" hums drenched in tape delay and warm spring reverb. Long stretches with no vocals at all.\\n\\nArrangement: Dusty boom-bap drums with a soft thumping kick, cracked snare with lazy swing, brushed hi-hats, low round sub bass. Warm Rhodes piano chords with slow chorus wobble as the harmonic bed, mellow jazzy guitar licks answering the vocal lines, constant vinyl crackle as texture. Intro: rain and vinyl noise, solo Rhodes chords fading in, drums slipping in halfway. Verses: minimal \\u2014 drums, bass, Rhodes, soft guitar fills between lines. Instrumental sections: guitar and Rhodes trade relaxed jazzy phrases over the beat, occasional muted trumpet ghost notes far in the background. Bridge: drums drop away to rain, crackle, and floating detuned Rhodes, then the beat eases back in. Outro: elements fade one by one until only vinyl crackle and a last unresolved Rhodes chord remain.", "lyrics": "[Intro]\\nMmm...\\n(rain on the window)\\nOoh...\\n\\n[Verse]\\nMidnight and the canvas glows\\nDragging little wires where the current flows\\nType a quiet dream, let the sampler drift\\nNoise into a picture, like the fog just lifts\\nTwenty slow steps, I'm in no hurry now\\nLatents turning colors and I don't know how\\nEvery render's like a polaroid I found\\nSoft focus memories, no sound\\n\\n[Instrumental]\\n\\n[Verse]\\nQueue another frame, let the motion breathe\\nPictures start to move like the falling leaves\\nVideo drifting by at twenty-four\\nLittle animations on my bedroom floor\\nSeed after seed like the rain outside\\nSome of them are keepers, some I let slide\\nSave the ones that feel like a Sunday slow\\nNode to node to node... and off we go\\n\\n[Chorus]\\nMmm... let it render on\\n(take your time, take your time)\\nOoh... by the morning it'll all be done\\n(one more queue, one more try)\\n\\n[Instrumental]\\n\\n[Bridge]\\nRain keeps drawing pictures on the glass...\\nMy machine keeps dreaming...\\nNeither of us fast...\\n\\n[Chorus]\\nMmm... let it render on\\n(take your time, take your time)\\nOoh... by the morning it'll all be done\\n(one more queue, one more try)\\n\\n[Instrumental]\\n\\n[Outro]\\nMmm...\\n(node to node)\\nOoh... goodnight", "seed": ["37:38", 0], "max_duration": 60, "cfg_scale": 1.7, "top_k": 50, "clip": ["37:3", 0]}, "class_type": "MiniMaxMusic3TextEncode", "_meta": {"title": "MiniMax Music3 \\u6587\\u672c\\u7f16\\u7801", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:3": {"inputs": {"clip_name": "minimax_music3_text_encoder_pruned_int8_convrot.safetensors", "type": "minimax", "device": "default"}, "class_type": "CLIPLoader", "_meta": {"title": "\\u52a0\\u8f7dCLIP", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:7": {"inputs": {"vae_name": "minimax_music3_dav.safetensors"}, "class_type": "VAELoader", "_meta": {"title": "\\u52a0\\u8f7dVAE", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:10": {"inputs": {"conditioning": ["37:13", 0]}, "class_type": "ConditioningZeroOut", "_meta": {"title": "\\u6761\\u4ef6\\u96f6\\u5316", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:15": {"inputs": {"seconds": ["37:13", 1], "batch_size": 1}, "class_type": "EmptyMiniMaxMusic3LatentAudio", "_meta": {"title": "\\u7a7a MiniMax Music3 \\u6f5c\\u7a7a\\u95f4\\u97f3\\u9891", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:9": {"inputs": {"seed": ["37:38", 0], "steps": 30, "cfg": 1.7, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": ["37:6", 0], "positive": ["37:13", 0], "negative": ["37:10", 0], "latent_image": ["37:15", 0]}, "class_type": "KSampler", "_meta": {"title": "K\\u91c7\\u6837\\u5668", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:12": {"inputs": {"samples": ["37:9", 0], "vae": ["37:7", 0]}, "class_type": "VAEDecodeAudio", "_meta": {"title": "VAE\\u89e3\\u7801\\uff08\\u97f3\\u9891\\uff09", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:38": {"inputs": {"seed": 197122968890040}, "class_type": "SeedNode", "_meta": {"title": "\\u79cd\\u5b50", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:42": {"inputs": {"tile_size": 1536, "overlap": 64, "samples": ["37:9", 0], "vae": ["37:7", 0]}, "class_type": "VAEDecodeAudioTiled", "_meta": {"title": "VAE\\u89e3\\u7801\\u97f3\\u9891\\uff08\\u5206\\u5757\\uff09", "cnr_id": "comfy-core", "ver": "0.31.0"}}, "37:43": {"inputs": {"switch": true, "on_false": ["37:12", 0], "on_true": ["37:42", 0]}, "class_type": "ComfySwitchNode", "_meta": {"title": "\\u5207\\u6362", "cnr_id": "comfy-core", "ver": "0.31.0"}}}`,
    props: { type: "textarea", rows: 6, placeholder: "在 ComfyUI 中用 Save (API Format) 导出的工作流 JSON" },
  },
  {
    type: "inputNumber",
    field: "defaultDuration" as const,
    title: "默认音频时长（秒）",
    value: 60,
    props: { min: 5, max: 300 },
  },
  {
    type: "inputNumber",
    field: "pollIntervalMs" as const,
    title: "轮询间隔（毫秒）",
    value: 3000,
    props: { min: 1000, max: 30000 },
  },
  {
    type: "inputNumber",
    field: "timeoutMinutes" as const,
    title: "生成超时（分钟）",
    value: 10,
    props: { min: 1, max: 60 },
  },
] as const;

const version = "1.0.0";

type workflowNode = { class_type?: string; inputs?: Record<string, unknown>; _meta?: { title?: string } };
type workflow = Record<string, workflowNode>;

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
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    signal.addEventListener("abort", abort, { once: true });
  });
}

function parseWorkflow(raw: unknown): workflow {
  if (!raw || typeof raw !== "string" || !raw.trim()) throw new Error("请先在设置中配置 MiniMax Music 工作流 JSON");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("工作流 JSON 必须是对象");
    return parsed as workflow;
  } catch (error) {
    throw new Error(`MiniMax Music 工作流 JSON 解析失败：${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 智能拆分提示词中的风格/元数据 (caption) 与 歌词/曲式标签 (lyrics)。
 * 1. 若显式包含「歌词：/Lyrics:」，分别提取 caption 和 lyrics；
 * 2. 若包含 [Intro]、[Verse] 等曲式标签，分段提取；
 * 3. 纯 BGM 场景（未提供歌词），caption 为完整提示词，lyrics 自动赋予 "[Instrumental]"。
 */
function splitMusicPrompt(prompt: string): { caption: string; lyrics: string } {
  const text = prompt.trim();
  if (!text) return { caption: "Cinematic traditional Chinese background music, dark suspense, guzheng, dizi, atmospheric", lyrics: "[Instrumental]" };

  const lyricsMarkerRegex = /(?:^|\n)\s*(?:歌词|lyrics|lyric)\s*[：:]\s*\n?/i;
  const match = text.match(lyricsMarkerRegex);
  if (match && match.index != null) {
    const captionPart = text.slice(0, match.index).trim();
    const lyricsPart = text.slice(match.index + match[0].length).trim();
    return {
      caption: captionPart || "Cinematic instrumental background music",
      lyrics: lyricsPart || "[Instrumental]",
    };
  }

  // 检查是否包含带方括号的标准曲式标签，如 [Verse]、[Chorus]
  const tagRegex = /(?:^|\n)\s*\[(Intro|Verse|Chorus|Bridge|Outro|Hook|Drop|Interlude|Pre-Chorus)\]/i;
  const tagMatch = text.match(tagRegex);
  if (tagMatch && tagMatch.index != null && tagMatch.index > 0) {
    return {
      caption: text.slice(0, tagMatch.index).trim(),
      lyrics: text.slice(tagMatch.index).trim(),
    };
  }

  // 默认纯 BGM 模式
  return {
    caption: text,
    lyrics: "[Instrumental]",
  };
}

function patchMusicWorkflow(workflow: workflow, caption: string, lyrics: string, duration?: number) {
  let textNodeFound = false;
  const randomSeed = Math.floor(Math.random() * 1_000_000_000_000_000);

  for (const node of Object.values(workflow)) {
    if (!node || !node.class_type) continue;
    const inputs = node.inputs ?? (node.inputs = {});

    // 匹配 MiniMaxMusic3 文本编码节点
    if (node.class_type.toLowerCase().includes("minimaxmusic") || node.class_type === "MiniMaxMusic3TextEncode") {
      inputs.caption = caption;
      inputs.lyrics = lyrics;
      if (typeof duration === "number" && duration > 0) {
        inputs.max_duration = duration;
      }
      textNodeFound = true;
    }

    // 注入随机种子
    if (node.class_type === "SeedNode" || node.class_type === "Seed") {
      inputs.seed = randomSeed;
    } else if (node.class_type === "KSampler" && typeof inputs.seed === "number") {
      inputs.seed = randomSeed;
    }
  }

  if (!textNodeFound) {
    throw new Error("工作流中未找到 MiniMaxMusic3TextEncode 节点，请确认导入了正确的 MiniMax Music 3.0 工作流");
  }
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
    throw new Error(`ComfyUI 提交失败（HTTP ${response.status}）：${text.slice(0, 300)}`);
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
  outputs?: Record<string, {
    audio?: { filename: string; subfolder?: string; type?: string }[];
    videos?: { filename: string; subfolder?: string; type?: string }[];
  }>;
};

async function pollResult(context: providerContext, base: string, promptId: string, signal: AbortSignal, intervalMs: number) {
  while (true) {
    await wait(signal, intervalMs);
    let entry: historyEntry | undefined;
    try {
      const response = await context.tool.fetch(`${base}/history/${encodeURIComponent(promptId)}`, { signal });
      if (!response.ok) continue;
      const history = (await response.json()) as Record<string, historyEntry>;
      entry = history?.[promptId];
    } catch (error) {
      if (signal.aborted) throw error;
      continue;
    }
    if (!entry) continue;
    const status = entry.status;
    if (status?.status_str?.toLowerCase() === "error") {
      const message = status.messages?.map((item) => (Array.isArray(item) ? item.join(": ") : String(item))).join("; ") ?? "";
      throw new Error(`ComfyUI 运行报错：${message.slice(0, 300) || "未知错误"}`);
    }
    if (status?.completed) {
      for (const output of Object.values(entry.outputs ?? {})) {
        const file = output?.audio?.[0];
        if (file) {
          const query = new URLSearchParams({ filename: file.filename, subfolder: file.subfolder ?? "", type: file.type ?? "output" });
          return `${base}/view?${query.toString()}`;
        }
      }
      throw new Error("ComfyUI 任务完成但未找到生成的音频文件；请确认工作流中包含 SaveAudio 或 SaveAudioAdvanced 节点");
    }
  }
}

export default {
  id: "comfyuiMiniMaxMusic",
  label: "ComfyUI MiniMax Music",
  version,
  readme: `通过本地或局域网 ComfyUI 的 MiniMax Music 3.0 模型生成高保真背景配乐（BGM）与歌曲音频。

【用法说明】：
1. 默认纯 BGM 模式：在画布「音频生成」节点的输入框直接写音乐风格提示词（例如：“古风悬疑配乐，深沉古筝与竹笛，低音心跳鼓，紧张氛围”），系统会自动以 [Instrumental] 模式生成纯器乐伴奏；
2. 带歌词模式：可在输入框写“风格：...\n歌词：...”或包含 [Intro]、[Verse]、[Chorus] 曲式标签，系统会自动分离曲风与歌词；
3. 前置要求：ComfyUI 已启动并安装 MiniMax-Music3 相关节点与模型权重。`,
  rules,
  models: [
    {
      id: "MiniMax-Music-03",
      label: "MiniMax Music 3.0 (ComfyUI)",
      type: "audio",
    },
  ],
  async generateAudio(request: { prompt?: string; text?: string; duration?: number }) {
    const baseUrl = String(this.config.baseUrl ?? "").trim().replace(/\/+$/, "");
    if (!baseUrl) throw new Error("请先配置 ComfyUI 服务地址");

    const workflow = parseWorkflow(this.config.workflow);
    const rawPrompt = (request.prompt ?? request.text ?? "").trim();
    const { caption, lyrics } = splitMusicPrompt(rawPrompt);
    const duration = typeof request.duration === "number" && request.duration > 0
      ? request.duration
      : typeof this.config.defaultDuration === "number" && this.config.defaultDuration > 0
        ? this.config.defaultDuration
        : 60;

    patchMusicWorkflow(workflow, caption, lyrics, duration);

    const timeoutMinutes = typeof this.config.timeoutMinutes === "number" && this.config.timeoutMinutes > 0 ? this.config.timeoutMinutes : 10;
    const intervalMs = typeof this.config.pollIntervalMs === "number" && this.config.pollIntervalMs > 0 ? this.config.pollIntervalMs : 3000;
    const signal = AbortSignal.any([AbortSignal.timeout(timeoutMinutes * 60_000), ...(this.signal ? [this.signal] : [])]);
    const stamp = Date.now().toString(36);
    const clientId = `toonflow-music-${stamp}`;
    const context: providerContext = this as providerContext;

    const promptId = await submitPrompt(context, baseUrl, workflow, clientId, signal);
    const audioUrl = await pollResult(context, baseUrl, promptId, signal, intervalMs);

    return [{ mediaType: "audio" as const, type: "url" as const, url: audioUrl }];
  },
};
