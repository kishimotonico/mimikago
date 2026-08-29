import { readdir } from "node:fs/promises";
import path from "node:path";

const RELATIVE_PREFIXES = ["../", "../../", "../../../", "../../../../", "../../../../../"];

export const CLIENT_LAYER_RULES = [
  {
    from: "shared",
    to: ["entities", "features", "app"],
    message: "shared から entities/features/app への import は禁止",
  },
  {
    from: "entities",
    to: ["features", "app"],
    message: "entities から features/app への import は禁止",
  },
  {
    from: "features",
    to: ["app"],
    message: "features から app への import は禁止",
  },
];

export const FEATURE_SIBLING_MESSAGE = (from, to) =>
  `features/${from} から features/${to} への sibling import は禁止`;

export const SERVER_LAYER_RULES = [
  {
    from: "routes",
    to: "adapters",
    message: "routes から adapters への直接 import は禁止",
  },
  {
    from: "adapters",
    to: "routes",
    message: "adapters から routes への import は禁止",
  },
  {
    from: "core",
    to: "routes",
    message: "core から routes への import は禁止",
  },
  {
    from: "core",
    to: "adapters",
    message: "core から adapters への import は禁止",
  },
  {
    from: "adapters/fixture",
    to: "adapters/real",
    message: "adapters/fixture から adapters/real への import は禁止",
  },
  {
    from: "adapters/real",
    to: "adapters/fixture",
    message: "adapters/real から adapters/fixture への import は禁止",
  },
];

export function relativeAndGlobGroups(segments) {
  const joined = segments.join("/");
  const last = segments[segments.length - 1];
  const groups = [`**/${joined}/**`];
  for (const prefix of RELATIVE_PREFIXES) {
    groups.push(`${prefix}${joined}/**`);
    if (segments.length > 1) groups.push(`${prefix}${last}/**`);
  }
  return groups;
}

export function siblingImportGroups(featureName) {
  const groups = [`**/features/${featureName}/**`];
  for (const prefix of RELATIVE_PREFIXES) {
    groups.push(`${prefix}${featureName}/**`);
  }
  return groups;
}

export function oxlintRestricted(patterns) {
  return [
    "error",
    {
      patterns: patterns.map(({ group, message }) => ({ group, message })),
    },
  ];
}

export async function listFeatureNames(repoRoot) {
  const featuresRoot = path.join(repoRoot, "client/src/features");
  return (await readdir(featuresRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function buildOxlintLayerOverrides(featureNames) {
  const overrides = [];
  const featuresToApp = CLIENT_LAYER_RULES.find((rule) => rule.from === "features");

  for (const rule of CLIENT_LAYER_RULES.filter((item) => item.from !== "features")) {
    overrides.push({
      files: [`**/client/src/${rule.from}/**`],
      rules: {
        "no-restricted-imports": oxlintRestricted(
          rule.to.map((to) => ({
            group: relativeAndGlobGroups([to]),
            message: rule.message,
          })),
        ),
      },
    });
  }

  for (const from of featureNames) {
    const others = featureNames.filter((name) => name !== from);
    const patterns = [];
    if (featuresToApp) {
      patterns.push(
        ...featuresToApp.to.map((to) => ({
          group: relativeAndGlobGroups([to]),
          message: featuresToApp.message,
        })),
      );
    }
    patterns.push(
      ...others.map((to) => ({
        group: siblingImportGroups(to),
        message: FEATURE_SIBLING_MESSAGE(from, to),
      })),
    );
    overrides.push({
      files: [`**/client/src/features/${from}/**`],
      rules: {
        "no-restricted-imports": oxlintRestricted(patterns),
      },
    });
  }

  const serverByFrom = new Map();
  for (const rule of SERVER_LAYER_RULES) {
    const list = serverByFrom.get(rule.from) ?? [];
    list.push(rule);
    serverByFrom.set(rule.from, list);
  }
  for (const [from, rules] of serverByFrom) {
    overrides.push({
      files: [`**/server/src/${from}/**`],
      rules: {
        "no-restricted-imports": oxlintRestricted(
          rules.map((rule) => ({
            group: relativeAndGlobGroups(rule.to.split("/")),
            message: rule.message,
          })),
        ),
      },
    });
  }

  return overrides;
}

export function isGeneratedLayerOverride(override) {
  const files = override.files ?? [];
  const hasRestricted = Boolean(override.rules?.["no-restricted-imports"]);
  if (!hasRestricted) return false;
  return files.some(
    (file) => file.startsWith("**/client/src/") || file.startsWith("**/server/src/"),
  );
}
