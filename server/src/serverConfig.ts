import { resolveStaticDir } from "./staticServe.ts";

export type AdapterKind = "real" | "fixture";

export interface ServerConfig {
  adapterKind: AdapterKind;
  port: number;
  mockScenario: string | undefined;
  thumbnailCacheDirOverride: string | undefined;
  staticDir: string | undefined;
}

function parseAdapterKind(adapterRaw: string): AdapterKind {
  if (adapterRaw === "real" || adapterRaw === "fixture") return adapterRaw;
  throw new Error(`不明な MIMIMILLI_ADAPTER です: ${adapterRaw}`);
}

export function resolveServerConfig(
  env: Record<string, string | undefined> = process.env,
): ServerConfig {
  const adapterKind = parseAdapterKind(env.MIMIMILLI_ADAPTER ?? "real");
  const port = Number(env.PORT ?? 8080);
  const mockScenario = env.MIMIMILLI_MOCK_SCENARIO;
  const thumbnailCacheDirOverride = env.MIMIMILLI_THUMBNAIL_CACHE_DIR;
  const staticDir = resolveStaticDir(env.MIMIMILLI_STATIC_DIR);

  return {
    adapterKind,
    port,
    mockScenario,
    thumbnailCacheDirOverride,
    staticDir,
  };
}
