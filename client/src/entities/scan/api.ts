// 候補一覧・除外の一覧・解除。features/scan と features/settings の両方から参照される共通API。
import { getParsed, postVoid } from "../../shared/api/http";
import {
  scanCandidateExclusionsResponseSchema,
  scanCandidatesMutationSchema,
} from "@mimimilli/shared";
import { SCAN_CANDIDATE_EXCLUSIONS_QUERY_KEY } from "./queryKeys";

export { SCAN_CANDIDATE_EXCLUSIONS_QUERY_KEY };

export async function getScanCandidateExclusions(): Promise<string[]> {
  const { paths } = await getParsed(
    scanCandidateExclusionsResponseSchema,
    "/scan/candidates/exclusions",
  );
  return paths;
}

export async function restoreScanCandidateExclusions(paths: string[]): Promise<void> {
  await postVoid(
    "/scan/candidates/exclusions/restore",
    scanCandidatesMutationSchema.parse({ paths }),
  );
}
