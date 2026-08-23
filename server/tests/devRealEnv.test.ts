import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import path from "node:path";
import { test } from "node:test";
import { spyOn } from "bun:test";
import { resolveDataPaths } from "../src/adapters/real/dataRoot.ts";
import * as devRealEnv from "../../scripts/lib/devRealEnv.ts";

function linkedWorktreeDataDir(
  env: Record<string, string | undefined>,
  platform: "linux" | "win32",
  userHome: string,
  toplevel: string,
) {
  const productionRoot = resolveDataPaths(env, platform, userHome).root;
  const pathHash = createHash("sha256").update(toplevel).digest("hex").slice(0, 8);
  const dirName = `${path.basename(toplevel)}-${pathHash}`;
  return path.join(path.dirname(productionRoot), "mimimilli-worktrees", dirName);
}

test("MIMIMILLI_DATA_DIR明示時はdetectWorktreeを呼ばない", (t) => {
  const spy = spyOn(devRealEnv, "detectWorktree");
  t.after(() => spy.mockRestore());
  const extraEnv = devRealEnv.resolveExtraEnv(
    { MIMIMILLI_DATA_DIR: "/explicit/data" },
    "linux",
    "/home/test",
  );
  assert.deepEqual(extraEnv, {});
  assert.equal(spy.mock.calls.length, 0);
});

test("メイン作業ディレクトリでは本番データルートをそのまま使う", () => {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    logs.push(String(args[0]));
  };
  try {
    const extraEnv = devRealEnv.resolveExtraEnv({}, "linux", "/home/test", {
      toplevel: "/repo",
      isLinkedWorktree: false,
    });
    assert.deepEqual(extraEnv, {});
    assert.ok(logs[0]);
    assert.equal(
      logs[0]!,
      "[dev-real] メインの作業ディレクトリです。本番データディレクトリを使用します。",
    );
  } finally {
    console.log = originalLog;
  }
});

test("linked worktreeではLinux既定ルート隣の専用ディレクトリを設定する", () => {
  const toplevel = "/home/nico/projects/mimikago/.worktrees/379";
  const extraEnv = devRealEnv.resolveExtraEnv({}, "linux", "/home/test", {
    toplevel,
    isLinkedWorktree: true,
  });
  assert.equal(
    extraEnv.MIMIMILLI_DATA_DIR,
    linkedWorktreeDataDir({}, "linux", "/home/test", toplevel),
  );
  assert.match(extraEnv.MIMIMILLI_DATA_DIR!, /\/mimimilli-worktrees\/379-[0-9a-f]{8}$/);
});

test("linked worktreeではWindows既定ルート隣の専用ディレクトリを設定する", () => {
  const toplevel = "C:\\work\\mimikago\\.worktrees\\379";
  const env = { LOCALAPPDATA: "C:\\Users\\test\\AppData\\Local" };
  const extraEnv = devRealEnv.resolveExtraEnv(env, "win32", "C:\\Users\\test", {
    toplevel,
    isLinkedWorktree: true,
  });
  assert.equal(
    extraEnv.MIMIMILLI_DATA_DIR,
    linkedWorktreeDataDir(env, "win32", "C:\\Users\\test", toplevel),
  );
  const hash = createHash("sha256").update(toplevel).digest("hex").slice(0, 8);
  assert.ok(extraEnv.MIMIMILLI_DATA_DIR!.includes(`379-${hash}`));
});

test("linked worktreeの専用ディレクトリはresolveDataPathsの本番ルートと一致する", () => {
  const toplevel = "/tmp/worktrees/task-379";
  const env = { XDG_DATA_HOME: "/xdg" };
  const productionRoot = resolveDataPaths(env, "linux", "/home/test").root;
  const extraEnv = devRealEnv.resolveExtraEnv(env, "linux", "/home/test", {
    toplevel,
    isLinkedWorktree: true,
  });
  assert.equal(productionRoot, "/xdg/mimimilli");
  assert.equal(
    extraEnv.MIMIMILLI_DATA_DIR,
    path.join(
      "/xdg",
      "mimimilli-worktrees",
      `task-379-${createHash("sha256").update(toplevel).digest("hex").slice(0, 8)}`,
    ),
  );
});

test("異なるtoplevelはbasenameが同じでも専用ディレクトリが衝突しない", () => {
  const toplevelA = "/a/worktrees/379";
  const toplevelB = "/b/worktrees/379";
  const extraA = devRealEnv.resolveExtraEnv({}, "linux", "/home/test", {
    toplevel: toplevelA,
    isLinkedWorktree: true,
  });
  const extraB = devRealEnv.resolveExtraEnv({}, "linux", "/home/test", {
    toplevel: toplevelB,
    isLinkedWorktree: true,
  });
  assert.notEqual(extraA.MIMIMILLI_DATA_DIR, extraB.MIMIMILLI_DATA_DIR);
});
