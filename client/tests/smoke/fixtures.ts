// smoke用のworker単位サーバー起動とテスト間状態リセット。
// fixtureアダプタはBunサーバー1インスタンスにつき可変状態を1つ持つため、workerごとに
// 独立したBun+Viteのペアを立て、各テスト開始前にサーバー側の状態をリセットして分離する。
import { type ChildProcess, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { test as base } from "@playwright/test";

const VITE_PORT_RANGE_START = 4200;
const VITE_PORT_RANGE_SIZE = 500;
const BUN_PORT_RANGE_START = 4700;
const BUN_PORT_RANGE_SIZE = 500;

// worktreeの絶対パスから決定的にオフセットを導出し、そこへworkerIndexを足してworkerごとの
// ポートへ分散する（同一worktreeなら常に同じポート集合、worktree間の衝突も避ける）。
function derivePort(rangeStart: number, rangeSize: number, workerIndex: number): number {
  const base = createHash("sha256").update(process.cwd()).digest().readUInt32BE(0) % rangeSize;
  return rangeStart + ((base + workerIndex) % rangeSize);
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
      });
      if (!res.ok) throw new Error(`fixture状態のリセットに失敗しました: ${res.status}`);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
