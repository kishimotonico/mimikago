import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScanCandidate } from "@mimimilli/shared";
import {
  fetchScanCandidates,
  refreshScanCandidates,
  SCAN_CANDIDATES_QUERY_KEY,
} from "../../src/entities/scan/scanCandidatesCache";

const candidateA: ScanCandidate = {
  path: "候補A",
  inferredTitle: "候補A",
  audioFileCount: 1,
  audioBreakdown: [{ extension: "wav", count: 1 }],
  rjCode: null,
};

const candidateB: ScanCandidate = {
  path: "候補B",
  inferredTitle: "候補B",
  audioFileCount: 1,
  audioBreakdown: [{ extension: "wav", count: 1 }],
  rjCode: null,
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function readCache(queryClient: QueryClient): ScanCandidate[] | undefined {
  return queryClient.getQueryData(SCAN_CANDIDATES_QUERY_KEY);
}

describe("fetchScanCandidates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("サーバーから候補一覧を取得する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith("/scan/candidates")) {
          return jsonResponse({ candidates: [candidateA, candidateB] });
        }
        throw new Error(`unexpected fetch: ${String(input)}`);
      }),
    );

    await expect(fetchScanCandidates()).resolves.toEqual([candidateA, candidateB]);
  });
});

describe("refreshScanCandidates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("取得結果をクエリキャッシュへ反映する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith("/scan/candidates")) {
          return jsonResponse({ candidates: [candidateA, candidateB] });
        }
        throw new Error(`unexpected fetch: ${String(input)}`);
      }),
    );

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const result = await refreshScanCandidates(queryClient);

    expect(result).toEqual([candidateA, candidateB]);
    expect(readCache(queryClient)).toEqual([candidateA, candidateB]);
  });

  it("先行リクエスト実行中に状態変更後の再取得を呼ぶと、新しいサーバー状態が反映される", async () => {
    let firstRelease!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      firstRelease = resolve;
    });

    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith("/scan/candidates")) {
          callCount += 1;
          if (callCount === 1) {
            await firstGate;
            return jsonResponse({ candidates: [candidateA] });
          }
          return jsonResponse({ candidates: [candidateB] });
        }
        throw new Error(`unexpected fetch: ${String(input)}`);
      }),
    );

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const first = refreshScanCandidates(queryClient);
    const second = refreshScanCandidates(queryClient);
    firstRelease();

    const secondResult = await second;
    await first;

    expect(callCount).toBe(2);
    expect(secondResult).toEqual([candidateB]);
    expect(readCache(queryClient)).toEqual([candidateB]);
  });
});
