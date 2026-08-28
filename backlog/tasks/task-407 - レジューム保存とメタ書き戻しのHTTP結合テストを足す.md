---
id: TASK-407
title: レジューム保存とメタ書き戻しのHTTP結合テストを足す
status: Done
assignee: []
created_date: '2026-08-26 10:41'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - server/src/routes/works.ts
  - server/tests/real/resume.test.ts
  - server/tests/real/metaWriteback.test.ts
priority: medium
ordinal: 406000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。POST /works/:id/resume（routes/works.ts:125-136）の endpoint 文字列を踏む server テストは0件。real/resume.test.ts は DB helper 直呼び、client の resumePersistence は API を mock、smoke は page.request で事前POSTして表示確認だけ。メタ書き戻しも real/metaWriteback.test.ts が adapter 直呼びで、HTTP PATCH → real writeback の結合が無い。

再生位置保存とメタ書き戻しはこのアプリの中核なので、HTTP 契約から real adapter までを server テストで踏む。UI再生からの保存や Playwright での実デコードは今回の対象外（headless Chromium が fixture WAV をデコードしない制約は HANDOFF 記載どおり）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 POST /works/:id/resume をHTTP経由で呼び、204/400/404がreal adapterの結果と一致することを観測するテストがある
- [x] #2 PATCH /works/:id をHTTP経由で呼び、title/tagsがmimimilli.jsonへ書き戻されることを観測するテストがある
- [x] #3 テストは固定sleepに頼らない（TASK-393の方針に合わせる）
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. resumeのroute結合テストをrealで追加 2. PATCHメタ書き戻しのHTTP結合テストを追加 3. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
POST /works/:id/resume と PATCH /works/:id のreal HTTP結合テストを追加。pollUntil使用、本番実装変更なし。
<!-- SECTION:FINAL_SUMMARY:END -->
