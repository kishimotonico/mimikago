import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";
import { resolveDataPaths } from "../../server/src/adapters/real/dataRoot.ts";

export type WorktreeInfo = {
  toplevel: string;
  isLinkedWorktree: boolean;
};

/**
 * git worktree の状態を調べる。メインの作業ディレクトリなら git-dir と git-common-dir が一致し、
 * linked worktree なら git-dir が `<common-dir>/worktrees/<name>` を指すため両者が異なる。
 */
export function detectWorktree(): WorktreeInfo {
  const result = spawnSync(
    "git",
    ["rev-parse", "--path-format=absolute", "--show-toplevel", "--git-dir", "--git-common-dir"],
    { encoding: "utf8" },
  );
  if (result.error) {
    throw new Error(`gitコマンドの実行に失敗しました: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`git rev-parse が失敗しました: ${result.stderr.trim()}`);
  }
  const lines = result.stdout.trim().split("\n");
  const toplevel = lines[0];
  const gitDir = lines[1];
  const gitCommonDir = lines[2];
  if (!toplevel || !gitDir || !gitCommonDir) {
    throw new Error("git rev-parse の出力が不完全です");
  }
  const isLinkedWorktree = path.resolve(gitDir) !== path.resolve(gitCommonDir);
  return { toplevel, isLinkedWorktree };
}

export function resolveExtraEnv(
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform,
  userHome = homedir(),
  worktree?: WorktreeInfo,
): Record<string, string> {
  if (env.MIMIMILLI_DATA_DIR) {
    console.log(`[dev-real] MIMIMILLI_DATA_DIR が明示設定されています: ${env.MIMIMILLI_DATA_DIR}`);
    return {};
  }

  const { toplevel, isLinkedWorktree } = worktree ?? detectWorktree();
  if (!isLinkedWorktree) {
    console.log("[dev-real] メインの作業ディレクトリです。本番データディレクトリを使用します。");
    return {};
  }

  const productionRoot = resolveDataPaths(env, platform, userHome).root;
  const pathHash = createHash("sha256").update(toplevel).digest("hex").slice(0, 8);
  const dirName = `${path.basename(toplevel)}-${pathHash}`;
  const dataDir = path.join(path.dirname(productionRoot), "mimimilli-worktrees", dirName);
  console.log(
    `[dev-real] linked worktree を検出しました（${toplevel}）。専用データディレクトリを使用します: MIMIMILLI_DATA_DIR=${dataDir}`,
  );
  return { MIMIMILLI_DATA_DIR: dataDir };
}
