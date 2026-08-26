---
id: TASK-408
title: smokeのresetが実行中ジョブを止めずERR_ABORTEDを隠すのを直す
status: Done
assignee: []
created_date: '2026-08-26 10:41'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - server/src/app.ts
  - client/tests/smoke/support.ts
  - client/tests/smoke/fixtures.ts
priority: medium
ordinal: 407000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。2点とも TASK-383 で並列化した smoke の分離保証。

(1) /api/__test__/reset（app.ts:75-80）は adapter.resetFixtureState() だけで、ScanJobManager / DlsiteJobManager の実行中ジョブを cancel/await しない。失敗後も worker server を再利用するため、残ジョブが次テストを汚染し得る。

(2) support.ts:52-57 は requestfailed の net::ERR_ABORTED を無条件除外し、意図的キャンセルと実障害の中断を区別しない。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 reset endpointが実行中のscan/DLsiteジョブを停止し、完了を待ってからfixture stateを戻す
- [x] #2 ERR_ABORTEDの除外がナビゲーション由来の中断に限定され、重要APIの途中失敗をassertNoErrorsが拾える
- [x] #3 pnpm test:smokeが緑
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. resetでジョブcancel/awaitを追加 2. ERR_ABORTED除外をナビゲーション中断に限定 3. test:smoke
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
resetがscan/DLsiteジョブをcancel+await。ERR_ABORTEDはナビゲーション中断に限定。test:smoke 23件緑。
<!-- SECTION:FINAL_SUMMARY:END -->
