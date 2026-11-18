#!/bin/bash
# 一键启动前端 + 后端 + codexBridge 中间件，Ctrl+C 同时退出。
# 用法：bash scripts/devAll.sh [codexBridge 额外参数...]，例如 bash scripts/devAll.sh --port 8791
cd "$(dirname "$0")/.." || exit 1

prefix() {
  while IFS= read -r line; do printf '\033[%sm[%s]\033[0m %s\n' "$2" "$1" "$line"; done
}

trap 'kill 0' EXIT INT TERM

bun run dev:web 2>&1 | prefix web "32" &
bun run dev:server 2>&1 | prefix server "36" &
bun customProviders/codexBridge/server.ts "$@" 2>&1 | prefix codex "33" &

wait
