import { useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
import type { ScanCandidate, ScanLastResultResponse } from "@mimimilli/shared";
import { getLastScanResult, SCAN_QUERY_KEYS } from "../api";
import { fetchScanCandidates } from "../../../entities/scan/scanCandidatesCache";
import { scanCandidateHiddenPathsAtom } from "../../../entities/scan/model/atoms";

const EMPTY_SCAN_CANDIDATES: ScanCandidate[] = [];

export function syncScanCandidatesFromLast(
  last: ScanLastResultResponse | null | undefined,
  candidates: ScanCandidate[] | undefined,
): ScanCandidate[] | undefined {
  if (candidates !== undefined) return candidates;
  return last?.result.candidates;
}

export function useScanCandidatesCache(): ScanCandidate[] {
  const lastQuery = useQuery({
    queryKey: SCAN_QUERY_KEYS.last(),
    queryFn: getLastScanResult,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  });

  // 明示的な refreshScanCandidates 呼び出し以外では取得しない（scanCandidatesCache 参照）。
  const candidatesQuery = useQuery({
    queryKey: SCAN_QUERY_KEYS.candidates(),
    queryFn: fetchScanCandidates,
    enabled: false,
  });

  const hiddenPaths = useAtomValue(scanCandidateHiddenPathsAtom);

  const source =
    syncScanCandidatesFromLast(lastQuery.data, candidatesQuery.data) ?? EMPTY_SCAN_CANDIDATES;

  return hiddenPaths.size === 0
    ? source
    : source.filter((candidate) => !hiddenPaths.has(candidate.path));
}

export function useUnregisteredCandidateCount(): number {
  return useScanCandidatesCache().length;
}
