// listDescendantWorkRefs / listFsWorkRefs の LIKE 子孫判定（アンダースコア境界）の回帰テスト。
import assert from "node:assert/strict";
import { test } from "node:test";
import { openDb } from "../../src/adapters/real/db.ts";
import { createWorkRepos, makeWork, upsertTestWork } from "../helpers/workTestUtils.ts";
import { makeTestScope } from "../helpers/sampleLibrary.ts";

test("listDescendantWorkRefs: アンダースコア入りフォルダ名は別パスの作品を子孫と誤判定しない", (t) => {
  const scope = makeTestScope();
  t.after(scope.cleanup);
  const db = scope.own(openDb({ kind: "memory" }));
  const { query, catalog, user } = createWorkRepos(db);
  const parentPath = "/library/A_B";
  const trueChildPath = "/library/A_B/child";
  const falseMatchPath = "/library/AXB/child";

  upsertTestWork(catalog, user, makeWork({ id: "true-child", physicalPath: trueChildPath }));
  upsertTestWork(catalog, user, makeWork({ id: "false-match", physicalPath: falseMatchPath }));

  const descendants = query.listDescendantWorkRefs(parentPath);
  assert.equal(descendants.length, 1);
  assert.equal(descendants[0]?.physicalPath, trueChildPath);
});

test("listFsWorkRefs: アンダースコア入り祖先パスは別パスの作品を子孫と誤判定しない", (t) => {
  const scope = makeTestScope();
  t.after(scope.cleanup);
  const db = scope.own(openDb({ kind: "memory" }));
  const { query, catalog, user } = createWorkRepos(db);
  const ancestorPath = "/library/A_B";
  const trueChildPath = "/library/A_B/child";
  const falseMatchPath = "/library/AXB/child";

  upsertTestWork(catalog, user, makeWork({ id: "true-child", physicalPath: trueChildPath }));
  upsertTestWork(catalog, user, makeWork({ id: "false-match", physicalPath: falseMatchPath }));

  const refs = query.listFsWorkRefs(ancestorPath);
  const paths = refs.map((ref) => ref.physicalPath).sort();
  assert.deepEqual(paths, [trueChildPath]);
});
