#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildOxlintLayerOverrides,
  isGeneratedLayerOverride,
  listFeatureNames,
} from "./layer-boundary-rules.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const oxlintrcPath = path.join(repoRoot, ".oxlintrc.json");

export async function nextOxlintConfig(repoRootPath = repoRoot) {
  const config = JSON.parse(await readFile(path.join(repoRootPath, ".oxlintrc.json"), "utf8"));
  const featureNames = await listFeatureNames(repoRootPath);
  const generated = buildOxlintLayerOverrides(featureNames);
  const preserved = (config.overrides ?? []).filter(
    (override) => !isGeneratedLayerOverride(override),
  );
  return { ...config, overrides: [...generated, ...preserved] };
}

async function main() {
  const next = await nextOxlintConfig();
  await writeFile(oxlintrcPath, `${JSON.stringify(next, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
