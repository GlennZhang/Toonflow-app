// Codex 本地出图桥接：把本机 codex CLI（ChatGPT 登录 + image_generation）包装成 HTTP 服务，
// 供 Toonflow 自定义供应商（codexImage.ts）调用。协议与提示词模板移植自 LocalMiniDrama callCodexImageApi。
// 仅监听回环地址、不做鉴权，不要暴露到公网。启动：bun customProviders/codexBridge/server.ts
// ACT: 此处直接用 node:fs 而非 @toonflow/file——本脚本是独立运行的工具（bun customProviders/codexBridge/server.ts），
// 不依赖仓库工作区安装状态；应用源码仍遵守统一文件入口规范。
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);

function argValue(flag: string, fallback: string) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1]! : fallback;
}

const port = Number(argValue("--port", process.env.CODEX_BRIDGE_PORT ?? "8790"));
const codexBin = argValue("--codex-bin", "codex");
const proxy = argValue("--proxy", "http://127.0.0.1:7887");
const model = argValue("--model", "");
const defaultTimeoutMs = Number(argValue("--timeout-ms", "600000"));

// codex 单次出图 2-4 分钟且共享登录态与本机文件系统，直接串行排队最简单安全。
let queueTail: Promise<unknown> = Promise.resolve();
let running = 0;
let pending = 0;

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queueTail.then(task, task);
  queueTail = result.catch(() => {});
  return result;
}

function aspectHintFromSize(size: string | undefined) {
  if (!size) return "";
  const match = /^(\d+)\s*[x×*]\s*(\d+)$/i.exec(size.trim());
  if (!match) return "";
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return "";
  const ratio = width / height;
  const near = (target: number, tolerance: number) => Math.abs(ratio - target) <= tolerance;
  const label = near(1, 0.05)
    ? "1:1"
    : near(16 / 9, 0.1)
      ? "16:9"
      : near(9 / 16, 0.1)
        ? "9:16"
        : near(4 / 3, 0.1)
          ? "4:3"
          : near(3 / 4, 0.1)
            ? "3:4"
            : `${width}:${height}`;
  return `Output aspect ratio: ${label}.`;
}

async function materializeRef(ref: string, directory: string, index: number) {
  const dataMatch = /^data:image\/([\w.+-]+);base64,(.+)$/s.exec(ref);
  if (dataMatch) {
    const rawExt = dataMatch[1]!.toLowerCase();
    const ext = rawExt === "jpeg" ? "jpg" : rawExt;
    const path = join(directory, `ref_${index}.${ext}`);
    await writeFile(path, Buffer.from(dataMatch[2]!, "base64"));
    return path;
  }
  if (/^https?:\/\//i.test(ref)) {
    const response = await fetch(ref);
    if (!response.ok) return null;
    const path = join(directory, `ref_${index}.png`);
    await writeFile(path, Buffer.from(await response.arrayBuffer()));
    return path;
  }
  return null;
}

async function collectPngs(directory: string, found: string[] = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) await collectPngs(entryPath, found);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) found.push(entryPath);
  }
  return found;
}

// 主输出缺失（代理 websocket 偶发抖动）时回退扫 ~/.codex/generated_images/ 的最新 PNG。
async function findFallbackOutput(startMs: number) {
  const directory = join(homedir(), ".codex", "generated_images");
  if (!existsSync(directory)) return null;
  let newest: { path: string; mtime: number } | null = null;
  for (const path of await collectPngs(directory)) {
    const info = await stat(path);
    if (info.mtimeMs < startMs - 5000) continue;
    if (!newest || info.mtimeMs > newest.mtime) newest = { path, mtime: info.mtimeMs };
  }
  return newest?.path ?? null;
}

type codexRun = { ok: boolean; code: number | null; stdout: string; stderr: string; error?: string };

async function runCodex(cmd: string[], options: { cwd: string; timeoutMs: number; onAbort?: (kill: () => void) => void }): Promise<codexRun> {
  let child;
  try {
    child = Bun.spawn({
      cmd,
      cwd: options.cwd,
      env: { ...process.env, HTTPS_PROXY: proxy, HTTP_PROXY: proxy },
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
    });
  } catch (error) {
    return {
      ok: false,
      code: null,
      stdout: "",
      stderr: "",
      error: `codex 启动失败（${cmd[0]}）：${error instanceof Error ? error.message : String(error)}`,
    };
  }
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill("SIGTERM");
    setTimeout(() => child.kill("SIGKILL"), 5000);
  }, options.timeoutMs);
  options.onAbort?.(() => child.kill("SIGTERM"));
  const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
  clearTimeout(timer);
  if (timedOut) return { ok: false, code, stdout, stderr, error: `codex 超时（${options.timeoutMs}ms）` };
  return { ok: code === 0, code, stdout, stderr };
}

async function handleGenerate(body: { prompt?: unknown; refs?: unknown; size?: unknown; timeoutMs?: unknown }, signal?: AbortSignal) {
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) throw Object.assign(new Error("prompt 不能为空"), { status: 400 });
  const refs = Array.isArray(body.refs) ? body.refs.filter((item): item is string => typeof item === "string" && !!item.trim()) : [];
  const size = typeof body.size === "string" ? body.size : undefined;
  const timeoutMs = Number.isFinite(Number(body.timeoutMs)) && Number(body.timeoutMs) > 0 ? Number(body.timeoutMs) : defaultTimeoutMs;

  const directory = await mkdtemp(join(tmpdir(), "codex_img_"));
  let killOnAbort: (() => void) | undefined;
  signal?.addEventListener("abort", () => killOnAbort?.(), { once: true });
  try {
    const refFiles: string[] = [];
    for (const [index, ref] of refs.entries()) {
      const file = await materializeRef(ref, directory, index).catch(() => null);
      if (file) refFiles.push(file);
    }
    if (refs.length > 0 && refFiles.length === 0) throw Object.assign(new Error("参考图全部获取失败"), { status: 400 });

    const outPath = join(directory, "codex_output.png");
    let fullPrompt = `Generate exactly ONE image and save it as a PNG file to this absolute path: ${outPath}\n\n`;
    if (refFiles.length > 0) {
      fullPrompt += `You are given ${refFiles.length} attached reference image(s). Maintain strict visual consistency with the reference image(s), especially the subject's appearance, character features, prop design, framing, camera angle, and scroll/object width, while applying the modifications described below. Do not create a grid, collage, or split image; produce a single continuous image.\n\n`;
    }
    fullPrompt += prompt;
    const hint = aspectHintFromSize(size);
    if (hint) fullPrompt += `\n\n${hint}`;
    fullPrompt += `\n\nAfter generating, ensure the PNG file exists at ${outPath}. Use the image generation tool directly; do not write helper code scripts.`;

    // -i 是贪婪可变参数，用 -- 终止选项解析，保证 prompt 作为位置参数传入。
    const cmd = [
      codexBin,
      "exec",
      "-s",
      "workspace-write",
      "-C",
      directory,
      "--skip-git-repo-check",
      ...refFiles.flatMap((file) => ["-i", file]),
      ...(model ? ["-m", model] : []),
      "--",
      fullPrompt,
    ];
    const startMs = Date.now();
    console.log(`[codexBridge] 开始出图 refs=${refFiles.length}/${refs.length} timeout=${timeoutMs}ms`);
    const run = await runCodex(cmd, {
      cwd: directory,
      timeoutMs,
      onAbort: (kill) => {
        killOnAbort = kill;
      },
    });
    if (signal?.aborted) throw new Error("客户端已取消");
    const found = (existsSync(outPath) && outPath) || (await findFallbackOutput(startMs));
    if (!found) throw new Error(run.error || `codex 未生成图片文件（退出码 ${run.code}）：${(run.stderr || run.stdout || "").slice(-300)}`);
    const bytes = await readFile(found);
    if (!bytes.length) throw new Error("codex 生成的图片文件为空");
    console.log(
      `[codexBridge] 出图成功 ${Math.round(bytes.length / 1024)}KB 耗时 ${Date.now() - startMs}ms${found !== outPath ? "（回退扫描）" : ""}`,
    );
    return { image: `data:image/png;base64,${Buffer.from(bytes).toString("base64")}` };
  } finally {
    await rm(directory, { recursive: true, force: true }).catch(() => {});
  }
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, busy: running > 0, queue: pending });
    }
    if (request.method === "POST" && url.pathname === "/generate") {
      let body: { prompt?: unknown; refs?: unknown; size?: unknown; timeoutMs?: unknown };
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "请求体不是合法 JSON" }, { status: 400 });
      }
      pending++;
      try {
        const result = await enqueue(() => {
          running++;
          return handleGenerate(body, request.signal).finally(() => {
            running--;
          });
        });
        return Response.json(result);
      } catch (error) {
        const status = (error as { status?: number }).status ?? 500;
        return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status });
      } finally {
        pending--;
      }
    }
    return Response.json({ error: "未找到接口" }, { status: 404 });
  },
});

console.log(`[codexBridge] 已启动 http://127.0.0.1:${server.port}（codex=${codexBin} 代理=${proxy} 模型=${model || "默认"}）`);
