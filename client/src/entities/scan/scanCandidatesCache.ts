import type { QueryClient } from "@tanstack/react-query";
import { scanCandidatesResponseSchema, type ScanCandidate } from "@mimimilli/shared";
import { getParsed } from "../../shared/api/http";

export const SCAN_CANDIDATES_QUERY_KEY = ["scan", "candidates"] as const;

export async function fetchScanCandidates(): Promise<ScanCandidate[]> {
  const { candidates } = await getParsed(scanCandidatesResponseSchema, "/scan/candidates");
  return candidates;
}

/** サーバーから候補を明示的に取り直す。候補クエリは enabled:false のため、この呼び出し以外では
 *  再取得されない。並行呼び出しは QueryClient 自身の fetch dedupe で単一リクエストに集約される。 */
export function refreshScanCandidates(queryClient: QueryClient): Promise<ScanCandidate[]> {
  return queryClient.fetchQuery({
    queryKey: SCAN_CANDIDATES_QUERY_KEY,
    queryFn: fetchScanCandidates,
  });
}
