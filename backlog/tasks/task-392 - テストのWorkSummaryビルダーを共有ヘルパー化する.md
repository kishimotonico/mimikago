---
id: TASK-392
title: テストのWorkSummaryビルダーを共有ヘルパー化する
status: To Do
assignee: []
created_date: '2026-08-21 14:50'
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
- [ ] #1 makeWorkSummary(overrides)がserver/tests/helpersに存在し、4ファイルがそれを使っている
- [ ] #2 pnpm test:serverが緑
<!-- AC:END -->
