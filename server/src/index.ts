// エントリーポイント。Bun.serveで起動する。
// env:
//   PORT                    … 待受ポート（デフォルト 8080）
//   MIMIMILLI_ADAPTER       … "real"（デフォルト） | "fixture"（インメモリ開発データ）
//   MIMIMILLI_DATA_DIR       … DB・cache等のデータルート上書き
//   MIMIMILLI_DLSITE_CACHE_DB … DLsiteレスポンスキャッシュDBの絶対パス上書き
//   MIMIMILLI_DLSITE_OFFLINE … trueならDLsiteの実HTTPを遮断（既定 false）
//   MIMIMILLI_DLSITE_REQUEST_INTERVAL_MS … DLsite実HTTPの開始間隔（既定 1000ms）
//   MIMIMILLI_THUMBNAIL_CACHE_DIR … カバーサムネイルのキャッシュ置き場
//                                   （デフォルト ./data/cache/thumbnails）
//   MIMIMILLI_MOCK_SCENARIO … fixture アダプタのデータシナリオ
//                             ("default" | "empty" | "new-work" | "errors"、省略時 "default")
//   MIMIMILLI_STATIC_DIR    … client/dist 等の静的配信ルート（未設定ならAPIのみ）
import { resolve } from "node:path";
import { createFixtureAdapter } from "./adapters/fixture/index.ts";
import { resolveDataPaths } from "./adapters/real/dataRoot.ts";
import { resolveDlsiteCacheConfig } from "./adapters/real/dlsiteCache.ts";
import { resolveDlsiteRequestConfig } from "./adapters/real/dlsiteConfig.ts";
import { createRealAdapter } from "./adapters/real/index.ts";
import type { DataAdapter } from "./adapter/index.ts";
import {
  createDlsiteEventLogger,
  formatError,
  getCategoryLogger,
  initLogger,
} from "./lib/logger.ts";
import {
  createUnhandledRejectionReporter,
  registerProcessErrorHandlers,
} from "./lib/processErrorHandlers.ts";
import { performGracefulShutdown, runCleanupAndExit } from "./serverLifecycle.ts";
import { resolveServerConfig, type ServerConfig } from "./serverConfig.ts";
import { serveMimimilli } from "./serve.ts";
import { buildStartupLogProperties } from "./lib/startupLog.ts";

const config = resolveServerConfig();
const dataPaths = config.adapterKind === "real" ? resolveDataPaths() : undefined;
const { logFilePath } = await initLogger(dataPaths ? { logDir: dataPaths.logDir } : {});

const serverLogger = getCategoryLogger("server");

function createAdapter(config: ServerConfig): DataAdapter {
  switch (config.adapterKind) {
    case "fixture":
      return createFixtureAdapter({ scenario: config.mockScenario });
    case "real": {
      if (!dataPaths) {
        throw new Error("real adapter requires dataPaths");
      }
      return createRealAdapter({
        database: {
          kind: "files",
          catalogPath: dataPaths.catalogDb,
          userPath: dataPaths.userDb,
        },
        dbBackupDir: dataPaths.backupDir,
        dataRoot: dataPaths.root,
        dlsiteCache: resolveDlsiteCacheConfig(dataPaths.dlsiteCacheDb),
        dlsiteRequestConfig: resolveDlsiteRequestConfig(),
        dlsiteSchedulerDependencies: { logger: createDlsiteEventLogger() },
        thumbnailCacheDir: config.thumbnailCacheDirOverride
          ? resolve(config.thumbnailCacheDirOverride)
          : dataPaths.thumbnailCache,
      });
    }
    default: {
      const unreachable: never = config.adapterKind;
      throw new Error(`不明な MIMIMILLI_ADAPTER です: ${unreachable}`);
    }
  }
}

let shuttingDown = false;
let adapter: DataAdapter | undefined;
let server: ReturnType<typeof Bun.serve> | undefined;
let app: ReturnType<typeof serveMimimilli>["app"] | undefined;

const reportUnhandledRejection = createUnhandledRejectionReporter((message, properties) => {
  serverLogger.error(message, properties);
});

async function shutdown(exitCode: number, reason: string, error?: unknown): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    if (error) {
      serverLogger.fatal(reason, formatError(error));
    } else {
      serverLogger.info(reason);
    }
  } catch (logError) {
    console.error(logError);
  }

  await runCleanupAndExit(() => performGracefulShutdown({ server, app, adapter }), exitCode);
}

registerProcessErrorHandlers({
  target: process,
  onUnhandledRejection: reportUnhandledRejection,
  onUncaughtException: (error) => {
    void shutdown(1, "未捕捉例外で終了します", error);
  },
  onSignal: (signal) => {
    void shutdown(
      0,
      signal === "SIGINT" ? "SIGINTを受信して終了します" : "SIGTERMを受信して終了します",
    );
  },
});

adapter = createAdapter(config);
const served = serveMimimilli({
  adapter,
  port: config.port,
  appOptions: { staticDir: config.staticDir },
});
app = served.app;
server = served.server;

serverLogger.info(
  `サーバーを起動しました: http://localhost:${server.port} (adapter: ${config.adapterKind})`,
  buildStartupLogProperties({
    adapterKind: config.adapterKind,
    dataPaths,
    logFilePath,
    scenario: config.mockScenario,
  }),
);
