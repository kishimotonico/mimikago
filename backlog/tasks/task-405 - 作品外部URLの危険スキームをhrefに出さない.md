---
id: TASK-405
title: 作品外部URLの危険スキームをhrefに出さない
status: Done
assignee: []
created_date: '2026-08-26 10:40'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - shared/src/work.ts
  - client/src/features/library/ui/preview/WorkInfoDialog.tsx
priority: medium
ordinal: 404000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。urlEntrySchema.url（shared/src/work.ts:30-33）は z.string() のみ。WorkInfoDialog.tsx:110-124 と WorkMetadataActions.tsx:115-129 が u.url をそのまま href に出す。mimimilli.json 経由の javascript: / data: URL がアプリオリジンで実行できる。

スキーマで http(s) に限り、表示側も許可スキーム以外をリンク化しない。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 urlEntrySchemaがhttpおよびhttps以外のスキームを拒否する
- [x] #2 作品情報の外部リンクはhttp(s)のみhrefになり、それ以外はリンク化されない
- [x] #3 既存のhttp(s)リンク表示は維持される
- [x] #4 スキーマ拒否を観測するテストがある
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. urlEntrySchemaをhttp(s)限定にする 2. 表示側でもスキーム検査 3. スキーマ/表示のテスト 4. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
urlEntrySchemaと表示をhttp(s)絶対URLに限定。危険スキームはリンク化しない。schema/UIテストと負の検証済み。
<!-- SECTION:FINAL_SUMMARY:END -->
