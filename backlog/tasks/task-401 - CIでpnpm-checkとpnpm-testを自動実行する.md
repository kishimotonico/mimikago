---
id: TASK-401
title: CIでpnpm checkとpnpm testを自動実行する
status: Done
assignee: []
created_date: '2026-08-26 10:40'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - package.json
priority: high
ordinal: 400000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。.github/ が無く、pnpm check と pnpm test は人力運用。忘れれば壊れたまま master に入る。

push と pull request で Ubuntu 上の GitHub Actions が pnpm check && pnpm test を走らせる。smoke（Playwright）と Windows は TASK-345 が未完了で並列 real テストの EBUSY があるため、今回の対象外。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 masterへのpushとpull requestでGitHub Actionsがpnpm checkとpnpm testを実行する
- [x] #2 ローカルと同じ入口（ルートのpnpm check / pnpm test）を使い、独自の部分実行に分岐しない
- [x] #3 失敗するとマージ可能な状態にならない（必須チェックとして見える）
- [x] #4 ワークフローの起動方法がHANDOFFかREADMEに1箇所書かれている
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. .github/workflows を追加してpnpm check/testを走らせる 2. HANDOFFまたはREADMEに起動条件を追記 3. ワークフローが意図どおり起動することを確認
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
GitHub Actions（master push/PR、Ubuntu）で pnpm check && pnpm test を実行。案内はREADME。required checkはリポジトリ設定が別途必要。
<!-- SECTION:FINAL_SUMMARY:END -->
