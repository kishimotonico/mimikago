---
id: TASK-400
title: DLsite進捗SSEの購読リークと永久待機を直す
status: Done
assignee: []
created_date: '2026-08-26 10:39'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - server/src/routes/dlsite.ts
  - server/src/routes/scan.ts
priority: high
ordinal: 399000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。GET /dlsite/events（server/src/routes/dlsite.ts:159-185）は writeSSE の失敗を吸収せず、terminal 時の written.then(resolveDone) に失敗ハンドラが無い。切断中の書き込みで chain が reject すると await done が解けず、await chain が throw すると末尾の unsubscribe() に到達しない。

常駐アプリなので接続異常のたびに購読者が残る。scan 側 SSE（routes/scan.ts:181-194）は writeChain の reject 吸収と stop() での unsubscribe 済み。同じ方針に揃える。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 writeSSEが失敗・切断しても購読がunsubscribeされ、awaitが終わらない状態にならない
- [x] #2 正常完了・キャンセル時の進捗イベント配信は従来どおり最後まで届く
- [x] #3 scan側SSEと対称な資源回収になっている（try/finallyまたは同等）
- [x] #4 切断・書込失敗を観測するテストがあり、修正を戻すと落ちる
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. dlsite eventsをscan SSEと同じくreject吸収とfinally unsubscribeへ 2. 切断・書込失敗のテストと負の検証 3. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
DLsite SSEをscan側と同じreject吸収とfinally unsubscribeに揃えた。切断時のlistenerリークテストと負の検証済み。
<!-- SECTION:FINAL_SUMMARY:END -->
