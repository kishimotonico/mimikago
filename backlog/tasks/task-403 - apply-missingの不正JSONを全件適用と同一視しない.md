---
id: TASK-403
title: apply-missingの不正JSONを全件適用と同一視しない
status: Done
assignee: []
created_date: '2026-08-26 10:40'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - server/src/routes/dlsite.ts
  - server/src/adapters/fixture/dlsiteMethods.ts
priority: medium
ordinal: 402000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。POST /dlsite/apply-missing（routes/dlsite.ts:119-131）は c.req.json().catch(() => null) の失敗を body===null として workIds=undefined に落とす。fixture の dlsiteApplyMissing は workIds 未指定なら全作品対象（adapters/fixture/dlsiteMethods.ts:48-50）。壊れたリクエストが全件適用に化ける。

不正JSONは 400。省略（空body）で全件適用する契約を残すなら、パース失敗と省略を分け、shared のリクエストスキーマで固定する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 不正なJSONやJSON nullを送ると400になり、作品へ適用されない
- [x] #2 workIdsを省略した正当なリクエストの全件適用契約は、残すならスキーマで明示されテストされている
- [x] #3 workIdsが文字列配列でない正当JSONは400になる（現状のinvalidRequestと同等）
- [x] #4 上記を観測するテストがあり、修正を戻すと落ちる
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 不正JSONと省略を分岐しsharedスキーマを追加 2. 400/全件のHTTPテストと負の検証 3. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
apply-missingは不正JSON/nullを400。空bodyと{}の全件適用はsharedスキーマで明示。HTTPテストで負の検証済み。
<!-- SECTION:FINAL_SUMMARY:END -->
