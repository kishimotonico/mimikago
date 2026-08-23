#!/usr/bin/env node
// dev:real 起動ラッパー。
//
// linked worktree（git worktree add で作られた作業ディレクトリ）から real アダプタを起動すると、
// MIMIMILLI_DATA_DIR が未設定の場合にメインの作業ディレクトリと同じ本番データディレクトリ
// （server/src/adapters/real/dataRoot.ts の resolveDataPaths が返す既定パス）を共有してしまう。
// このスクリプトは pnpm から呼ばれる起動コマンドの前段に立ち、linked worktree を検出したときだけ
// worktree 専用の MIMIMILLI_DATA_DIR を自動設定する。git を意識するのはこの層のみで、
// アプリ本体（dataRoot.ts）は環境変数の有無しか見ない。
//
// 使い方: node scripts/dev-real.mjs -- <実行したいコマンド...>
import { spawnAndForward } from "./lib/spawnAndForward.mjs";
import { resolveExtraEnv } from "./lib/devRealEnv.ts";

function parseArgs(argv) {
  const sep = argv.indexOf("--");
  if (sep === -1 || sep === argv.length - 1) {
    throw new Error("使い方: node scripts/dev-real.mjs -- <実行したいコマンド...>");
  }
  return argv.slice(sep + 1);
}

function main() {
  const command = parseArgs(process.argv);
  const extraEnv = resolveExtraEnv(process.env, process.platform);
  const env = { ...process.env, ...extraEnv };

  spawnAndForward(command[0], command.slice(1), { env });
}

main();
