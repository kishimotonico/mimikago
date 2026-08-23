---
id: TASK-384
title: isDefaultTitleと関連テスト・文書を削除する
status: Done
assignee: []
created_date: '2026-08-21 14:49'
updated_date: '2026-08-23 02:01'
labels: []
dependencies: []
priority: low
ordinal: 384000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。core/dlsiteTitle.tsのisDefaultTitle(DLsiteタイトル自動適用ポリシー、TASK-42)は単体テスト7ケースが緑のまま、どのアダプタからも呼ばれていない。git履歴では一度本番配線されていた(commit a8c165d)が、TASK-320のpreview承認制化(commit 9354f50)で明示的な廃止判断の記録なく配線が消えた。ユーザー判断(2026-08-21)により、現行のpreview承認制と整合する「削除」で確定。docs/dlsite.md:44付近に自動適用が現行仕様として残っているので、文書も現行仕様(承認制)に合わせて更新する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 server/src/core/dlsiteTitle.tsとserver/tests/dlsiteTitle.test.tsが削除されている
- [x] #2 rg isDefaultTitle がリポジトリ全体で0件
- [x] #3 docs/dlsite.mdからタイトル自動適用の記述が消え、現行の承認制の説明と矛盾しない
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 参照調査 2. ファイル削除 3. docs更新 4. テスト・check
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
isDefaultTitle と dlsiteTitle.ts / dlsiteTitle.test.ts を削除。docs/dlsite.md のタイトル自動適用記述を削除。rg isDefaultTitle は backlog タスク本文以外 0 件。pnpm check / pnpm test 通過。
<!-- SECTION:FINAL_SUMMARY:END -->
