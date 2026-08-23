---
id: TASK-392
title: テストのWorkSummaryビルダーを共有ヘルパー化する
status: Done
assignee: []
created_date: '2026-08-21 14:50'
updated_date: '2026-08-23 01:37'
labels: []
dependencies: []
priority: low
ordinal: 392000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。server/tests配下の4ファイル(worksPagination.test.ts:16-34、smartFolderPagination.test.ts:21-39、real/worksQueryContract.test.ts:54-79、dlsiteNotifications.test.ts:17-44)がほぼ同一のWorkSummaryビルダーを個別定義しており、tagsフィールドが既に乖離し始めている([]とnts(["ASMR"]))。WorkSummary型へのフィールド追加のたびに4箇所を手動同期する必要があり、同期漏れは「そのテストだけ古いデフォルト値で通り続ける」という気づきにくい失敗になる。server/tests/helpers/workTestUtils.tsへmakeWorkSummary(overrides)を1つ用意し、4ファイルをoverrides方式へ寄せる(client側api.test.tsが既に採用している設計)。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 makeWorkSummary(overrides)がserver/tests/helpersに存在し、4ファイルがそれを使っている
- [x] #2 pnpm test:serverが緑
<!-- AC:END -->



## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. workTestUtils.ts に makeWorkSummary を追加 2. 4ファイルを共有ヘルパーへ移行 3. テスト実行・負の検証 4. pnpm check && pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
makeWorkSummary(overrides) を共有化。4ファイルはデフォルトと同じ詰め物 override を削り、index や検証に意味のあるフィールドだけ overrides で指定。dlsiteNotifications は index>=201 のときだけ dlsite を条件付き spread。
<!-- SECTION:FINAL_SUMMARY:END -->
