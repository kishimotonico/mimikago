import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { collectImports } from "./check-layer-boundaries.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const boundaryScript = path.join(scriptDir, "check-layer-boundaries.mjs");
const probeFile = path.join(repoRoot, "client/src/shared/__boundary_probe__.ts");

function runBoundaryCheck() {
  return spawnSync(process.execPath, [boundaryScript], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

test("collectImports collects dynamic import string literals", () => {
  const source = `const View = lazy(() => import("../features/files/ui/FilesView"));`;
  assert.deepEqual(collectImports(source), ["../features/files/ui/FilesView"]);
});

test("collectImports collects static and dynamic imports", () => {
  const source = `
    import { x } from "./a";
    const m = () => import("./b");
  `;
  assert.deepEqual(collectImports(source), ["./a", "./b"]);
});

test("collectImports collects TypeScript import type expressions without affecting boundary checks", () => {
  const source = `type X = import("@mimimilli/shared").TagFilters;`;
  assert.deepEqual(collectImports(source), ["@mimimilli/shared"]);
});

test("check-layer-boundaries detects injected dynamic import violations", async () => {
  await writeFile(
    probeFile,
    'export const load = () => import("../features/library/ui/LibraryView");\n',
    "utf8",
  );

  try {
    const result = runBoundaryCheck();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /shared から entities\/features\/app への import は禁止/);
    assert.match(
      result.stderr,
      /client\/src\/shared\/__boundary_probe__\.ts: shared から entities\/features\/app への import は禁止/,
    );
  } finally {
    await rm(probeFile, { force: true });
  }
});

test("check-layer-boundaries passes on the current repository", () => {
  const result = runBoundaryCheck();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /layer boundaries: ok/);
});
