---
id: TASK-422
title: dbBackupのkillタイミングテストを固定スリープから決定的な同期へ置き換える
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:57'
updated_date: '2026-08-29 17:44'
labels: []
dependencies: []
priority: low
ordinal: 421000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
server/tests/real/dbBackup.test.ts のmigration中断一貫性テストは、Bun.spawn直後に Bun.sleep(30) で待ってから SIGKILL している。新規bunプロセスの起動（ランタイム初期化・モジュール解決・DBオープン）が30msを超える環境ではmigration開始前にkillされ、検証したい中断状態を再現できず偽陰性のまま通過しうる。migration開始を示す観測可能なシグナル（マーカーファイル等）を待ってからkillする形へ置き換える。2026-08-28の全体監査で発見。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 killのタイミングが固定スリープでなくmigration進行の観測に同期する
- [x] #2 テストが意図した中断状態（migration途中でのkill）を決定的に再現する
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
openDb に onPendingMigration を通し、user の未適用 migration 直前でマーカーを書く。ハーネスはマーカー後に待ち、テストはマーカー出現を待って SIGKILL。catalog は dummy user で先に作り、user は 0004 のまま spawn させる。固定 sleep は削除。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
openDb に onPendingMigration を追加。ハーネスは user の未適用 migration 直前にマーカーを書き、Atomics.wait で SIGKILL まで停車する。テストはマーカー待ち後に kill。catalog は dummy user で先に作り、対象 user は 0004 のまま spawn する（従来の先に openDb すると kill 対象の migration が消える）。固定 sleep は削除。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
dbBackup の kill テストを固定 30ms sleep から user migration 開始マーカー同期へ置き換え、中断を決定的に再現するようにした。
<!-- SECTION:FINAL_SUMMARY:END -->
