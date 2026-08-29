import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const oxlintrcPath = path.join(repoRoot, ".oxlintrc.json");

const REQUIRED_PLUGINS = ["unicorn", "typescript", "oxc", "react", "jsx-a11y"];

const PROBE_SOURCE = `
export function extraBang(x: string | null): string {
  return x!!.length as unknown as string;
}

export function constCmp(n: number): boolean {
  return n > n;
}

export function newArr(): number[] {
  return new Array(3);
}
`;

function runOxlint(target) {
  return spawnSync("pnpm", ["exec", "oxlint", "-c", oxlintrcPath, "--format", "unix", target], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

test(".oxlintrc.json が既定プラグインを含めて指定している", async () => {
  const config = JSON.parse(await readFile(oxlintrcPath, "utf8"));
  assert.ok(Array.isArray(config.plugins), "plugins が配列であること");
  for (const plugin of REQUIRED_PLUGINS) {
    assert.ok(config.plugins.includes(plugin), `${plugin} プラグインが有効であること`);
  }
});

test("typescript/unicorn/oxc の意図的な違反を検知する", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "oxlint-plugins-"));
  const probe = path.join(dir, "probe.ts");
  await writeFile(probe, PROBE_SOURCE, "utf8");

  try {
    const result = runOxlint(probe);
    const output = `${result.stdout}\n${result.stderr}`;
    assert.match(output, /typescript\(no-extra-non-null-assertion\)/);
    assert.match(output, /unicorn\(no-new-array\)/);
    assert.match(output, /oxc\(const-comparisons\)/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
