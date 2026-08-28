---
id: TASK-411
title: clientのスキャン/DLsite完了後Promiseを所有しqueryKey直書きをやめる
status: Done
assignee: []
created_date: '2026-08-26 10:41'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - client/src/features/scan/ui/ScanRuntime.tsx
  - client/src/entities/file-system/queryKeys.ts
  - docs/client-error-handling.md
documentation:
  - docs/client-error-handling.md
priority: low
ordinal: 410000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。client-error-handling.md の Promise 所有権に対する逸脱と、queryKey ファクトリ迂回。

ScanRuntime.tsx:34 の void refreshScanCandidates、ScanModal.tsx:78、DlsiteBulkRuntime.tsx:55 の void invalidateDlsiteCache は失敗時に所有者が無く、refreshScanCandidates はキャンセル以外を再throwする。

FilePreview.tsx / FilesView.tsx が ['fs'] と ['scan','diagnostics'] をリテラルで持ち、entities/file-system/queryKeys.ts は directory しか定義しない。diagnostics は scan/api.ts にも重複定義がある。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 スキャン完了・モーダル更新・DLsite一括完了の再取得/invalidateが、失敗時にunhandled rejectionにならない（best-effortならcatchして握る）
- [x] #2 fs全体とscan diagnosticsのqueryKeyがファクトリ経由になり、リテラル直書きが無い
- [x] #3 diagnosticsキーの重複定義が1箇所にまとまっている
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. void呼び出しをcatch付きbest-effortにする 2. queryKeyをファクトリへ集約 3. 対象テストとpnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
完了後の再取得をbest-effort catch。fs全体とdiagnosticsのqueryKeyをファクトリへ集約。
<!-- SECTION:FINAL_SUMMARY:END -->
