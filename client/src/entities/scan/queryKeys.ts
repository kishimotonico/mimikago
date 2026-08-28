import { SCAN_CANDIDATES_QUERY_KEY } from "./scanCandidatesCache";

/** exclusionsはcandidatesの子キーなので、candidatesを無効化すれば連動して無効化される。 */
export const SCAN_CANDIDATE_EXCLUSIONS_QUERY_KEY = [
  ...SCAN_CANDIDATES_QUERY_KEY,
  "exclusions",
] as const;

export const SCAN_QUERY_KEYS = {
  last: () => ["scan", "last"] as const,
  candidates: () => SCAN_CANDIDATES_QUERY_KEY,
  candidateExclusions: () => SCAN_CANDIDATE_EXCLUSIONS_QUERY_KEY,
  diagnostics: () => ["scan", "diagnostics"] as const,
} as const;
