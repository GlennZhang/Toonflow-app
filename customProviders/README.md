# customProviders

自定义媒体供应商与配套脚本。这些文件不是应用源码，通过 Toonflow「设置 → 媒体模型 → 添加自定义供应商」导入使用。

## 1. ComfyUI MiniMax H3 视频生成（comfyuiMiniMaxH3.ts）

通过远程 ComfyUI 的 MiniMax H3 节点生成视频，支持文生视频（t2v）、首帧图生视频（i2v）、多参考图生视频（r2v，最多 10 张）。

**配置步骤：**

1. 导入 `comfyuiMiniMaxH3.ts`（粘贴或选文件）；
2. 在 ComfyUI 中分别加载三种模式的工作流，用 **Save (API Format)** 导出 JSON，粘贴到供应商设置的三个文本框；
3. 填写 ComfyUI 服务地址（远程地址即可，须能被运行 Toonflow 的机器访问——提交、上传、取回视频走同一地址）；
4. 在「编辑模型」里选择 MiniMax-H3 模型并保存。

**工作流要求：** API 格式（顶层 `{节点id: {class_type, inputs}}`）；包含 MiniMax H3 生成节点、`ResolutionSelector` 节点、标题含 Duration/时长的数值节点；i2v/r2v 需含 `LoadImage` 节点（r2v 参考图多于现有 LoadImage 时自动克隆）；输出需 `SaveVideo` 节点。导出方法：ComfyUI 设置勾选 Enable dev mode options → 菜单 Save (API Format)。

## 2. Codex 图片生成（codexImage.ts + codexBridge/）

通过本机 codex CLI（ChatGPT 账号登录）出图。codex 进程无法被 Toonflow 供应商沙箱直接调用，先启动本地桥接：

```bash
# 前置：codex login（ChatGPT 登录）且 image_generation feature 可用
bun customProviders/codexBridge/server.ts            # 默认 http://127.0.0.1:8790
bun customProviders/codexBridge/server.ts --port 8790 --proxy http://127.0.0.1:7887 --codex-bin codex
curl http://127.0.0.1:8790/health                    # 自检：{"ok":true,...}
```

然后导入 `codexImage.ts`，桥接地址保持默认即可。参考图自动经 `-i` 参数传给 codex（仅保持外观一致性，不复制构图）。

**注意：** 单张约 2-4 分钟，桥接串行排队，建议单人使用；桥接仅监听 127.0.0.1 且无鉴权，不要暴露到公网；ChatGPT 订阅有用量上限。

## 3. Qwen3-TTS 语音设计（qwenTts.ts）

调用本地 oMLX（OpenAI 兼容服务）上的 Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit，按文字描述设计角色声线并朗读台词。

**配置步骤：**

1. oMLX 已加载该模型（服务默认 `http://127.0.0.1:8989/v1`）；
2. 导入 `qwenTts.ts`，地址与 API Key 保持默认即可（未设鉴权填 `noapikey`）；
3. 画布添加「音频生成」节点，选择模型；**台词写在节点输入框**（或连接台词文本节点），**声线描述文本节点直接连入**——以 `VOICE DIRECTION` 开头的文本参考会自动作为声线指令传给模型，不会被朗读出来；
4. 未连接声线文本时使用模型默认音色。

**注意：** 声线文本节点不要连到视频生成节点——视频节点会把文本参考原样拼进提示词，导致人物把声线描述当作台词说出来。短句生成约 1-5 秒。

## 分镜提示词

视频分镜提示词建议配合 MiniMax H3 官方提示词模板（`packages/skills/h3PromptWriting` 技能）使用，按 T2VA/I2VA/Ref2VA 等模式组织三核心字段。
