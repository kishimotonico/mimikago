// smoke用のworker単位サーバー起動とテスト間状態リセット。
// fixtureアダプタはBunサーバー1インスタンスにつき可変状態を1つ持つため、workerごとに
// 独立したBun+Viteのペアを立て、各テスト開始前にサーバー側の状態をリセットして分離する。
import { type ChildProcess, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chromium, test as base } from "@playwright/test";
import { SMOKE_WORKERS } from "./workerCount.ts";

const VITE_PORT_RANGE_START = 4200;
const VITE_PORT_RANGE_SIZE = 500;
const BUN_PORT_RANGE_START = 4700;
const BUN_PORT_RANGE_SIZE = 500;

// fixture状態リセットのHTTP待ちがADR-0020のWSL blackhole（未使用ポートへの接続が
// 約2分ハングする既知障害）を踏まないよう、明示的に短いタイムアウトで打ち切る。
const RESET_FETCH_TIMEOUT_MS = 5_000;

// worktreeの絶対パスから決定的にブロックを選び、そこへworkerIndexを足してworkerごとの
// ポートへ分散する。SMOKE_WORKERS個ぶんを1ブロックとして割り当てるため、
// 異なるworktree同士でもブロック境界がずれない限りworker間のポートが重ならない。
function derivePort(rangeStart: number, rangeSize: number, workerIndex: number): number {
  const blockCount = Math.floor(rangeSize / SMOKE_WORKERS);
  const block = createHash("sha256").update(process.cwd()).digest().readUInt32BE(0) % blockCount;
  return rangeStart + block * SMOKE_WORKERS + workerIndex;
}

function waitForLog(proc: ChildProcess, pattern: RegExp, timeoutMs: number): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`起動ログ待ちがタイムアウトしました: ${pattern}`));
    }, timeoutMs);
    const onData = (chunk: Buffer) => {
      if (pattern.test(chunk.toString())) {
        cleanup();
        resolvePromise();
      }
    };
    const onExit = (code: number | null) => {
      cleanup();
      reject(new Error(`起動ログを待つ前にプロセスが終了しました (code ${code})`));
    };
    function cleanup() {
      clearTimeout(timer);
      proc.stdout?.off("data", onData);
      proc.off("exit", onExit);
    }
    proc.stdout?.on("data", onData);
    proc.once("exit", onExit);
  });
}

// Viteの"ready in"ログはサーバー起動時点のもので、依存の事前バンドル（optimizeDeps）は
// 実際にブラウザがモジュールグラフを辿って初回リクエストしたときに走る。workerが4並列で
// 同時にコールドスタートすると、この事前バンドルが各テストのbootTimeout（20s）を圧迫し
// 落ちうるため、worker起動時に一度だけ実ブラウザでページを開いて済ませておく。
async function warmUp(baseURL: string, timeoutMs: number): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    await page.locator(".mle-col.is-axis").waitFor({ state: "visible", timeout: timeoutMs });
  } finally {
    await browser.close();
  }
}

async function shutdown(proc: ChildProcess, timeoutMs: number): Promise<void> {
  if (proc.exitCode !== null) return;
  proc.kill("SIGTERM");
  await new Promise<void>((resolvePromise) => {
    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      resolvePromise();
    }, timeoutMs);
    proc.once("exit", () => {
      clearTimeout(timer);
      resolvePromise();
    });
  });
}

interface WorkerServers {
  baseURL: string;
  bunBaseURL: string;
}

export const test = base.extend<{ resetFixtureState: void }, { workerServers: WorkerServers }>({
  workerServers: [
    // Playwrightのfixture解決は第1引数のオブジェクト分割代入構文を静的解析するため、
    // 依存fixtureがなくても{}が必須。
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const bunPort = derivePort(BUN_PORT_RANGE_START, BUN_PORT_RANGE_SIZE, workerInfo.workerIndex);
      const vitePort = derivePort(
        VITE_PORT_RANGE_START,
        VITE_PORT_RANGE_SIZE,
        workerInfo.workerIndex,
      );

      const bunProc = spawn("bun", ["src/index.ts"], {
        cwd: "../server",
        env: {
          ...process.env,
          MIMIMILLI_ADAPTER: "fixture",
          MIMIMILLI_MOCK_SCENARIO: "new-work",
          PORT: String(bunPort),
        },
        stdio: ["ignore", "pipe", "pipe"],
      });
      await waitForLog(bunProc, /サーバーを起動しました/, 120_000);

      const viteProc = spawn(
        "pnpm",
        [
          "exec",
          "cross-env",
          "VITE_DISABLE_QUERY_DEVTOOLS=1",
          `MIMIMILLI_BACKEND_URL=http://127.0.0.1:${bunPort}`,
          "vite",
          "--host",
          "127.0.0.1",
          "--port",
          String(vitePort),
          "--strictPort",
        ],
        { stdio: ["ignore", "pipe", "pipe"] },
      );
      await waitForLog(viteProc, /ready in/, 120_000);
      await warmUp(`http://127.0.0.1:${vitePort}`, 60_000);

      await use({
        baseURL: `http://127.0.0.1:${vitePort}`,
        bunBaseURL: `http://127.0.0.1:${bunPort}`,
      });

      await shutdown(viteProc, 500);
      await shutdown(bunProc, 5_000);
    },
    { scope: "worker" },
  ],

  baseURL: async ({ workerServers }, use) => {
    await use(workerServers.baseURL);
  },

  resetFixtureState: [
    async ({ workerServers }, use) => {
      const res = await fetch(`${workerServers.bunBaseURL}/api/__test__/reset`, {
        method: "POST",
        signal: AbortSignal.timeout(RESET_FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`fixture状態のリセットに失敗しました: ${res.status}`);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
