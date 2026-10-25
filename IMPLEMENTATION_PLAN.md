# 实施计划：ComfyUI H3 视频 + Codex 图片 + H3 官方提示词模板

完整方案见批准的计划（feat/custom-providers 分支）。

## Stage 1: ComfyUI MiniMax H3 视频供应商
**Goal**: customProviders/comfyuiMiniMaxH3.ts（t2v/i2v/r2v 三模式，参考 LocalMiniDrama 协议）
**Success Criteria**: Bun.Transpiler 转译通过；可被 Toonflow「添加自定义供应商」静态校验接受
**Status**: Complete

## Stage 2: Codex 图片桥接 + 供应商
**Goal**: customProviders/codexBridge/server.ts + customProviders/codexImage.ts + customProviders/README.md
**Success Criteria**: 桥接 /health 与 /generate 冒烟通过（本机 codex 可用时）；供应商转译通过
**Status**: Complete

## Stage 3: MiniMax H3 官方提示词模板 + 9 技能复制
**Goal**: videoPromptCraft.md 新增 H3 模板段；packages/skills/ 复制 9 个官方技能并改小驼峰
**Success Criteria**: bun run typecheck 通过；新技能无 "MiniMax Hub" 残留；构建产物含 9 个新技能目录
**Status**: In Progress
