---
id: TASK-404
title: DLsite一括取得のキャンセルをerror終端にしない
status: Done
assignee: []
created_date: '2026-08-26 10:40'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - server/src/dlsiteJobManager.ts
priority: medium
ordinal: 403000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。DlsiteJobManager.runQueue の catch（dlsiteJobManager.ts:167-172）は controller.signal.aborted を見ず、常に type:"error" を emit する。キャンセル後に adapter.runDlsiteBulk が AbortError で reject すると、API/SSE 上は失敗になる。try 側の成功経路（:165-166）だけが aborted を cancelled にしている。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 実行中ジョブをキャンセルすると終端イベントはcancelledであり、errorではない
- [x] #2 キャンセル以外の例外は従来どおりerror終端になる
- [x] #3 上記を観測するテストがあり、修正を戻すと落ちる
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. catchでsignal.abortedならcancelledをemit 2. キャンセルと本失敗を分けるテストと負の検証 3. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
runQueueのcatchでabortedならcancelled。AbortError rejectテストと負の検証済み。
<!-- SECTION:FINAL_SUMMARY:END -->
