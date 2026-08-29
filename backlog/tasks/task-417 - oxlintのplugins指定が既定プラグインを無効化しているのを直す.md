---
id: TASK-417
title: oxlintのplugins指定が既定プラグインを無効化しているのを直す
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:56'
updated_date: '2026-08-29 17:18'
labels: []
dependencies: []
priority: medium
ordinal: 416000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
.oxlintrc.json:3 の plugins: ["react", "jsx-a11y"] は、oxlintの仕様上、既定プラグインセットを丸ごと上書きするため、既定でオンの typescript/unicorn/oxc プラグイン（約53ルール。no-floating-promises、no-misused-new、unbound-method、const-comparisons 等を含む）が意図せず無効化されている。既定プラグインを含めた指定へ直し、新たに出る指摘は修正するか根拠付きで個別ルールを無効化する。2026-08-28の全体監査で発見（未検証だが設定は実確認済み）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 typescript/unicorn/oxcプラグインのルールが有効になる
- [x] #2 新たに出た指摘がすべて修正されるか、無効化する場合はルール単位で根拠が設定に残る
- [x] #3 意図的な違反コードで検知が働くことを確認する（silent無効化の再発防止）
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. .oxlintrc.json の plugins に既定の unicorn/typescript/oxc を明示 2. 新たに出る unicorn 指摘2件を修正 3. 意図的な違反スニペットで typescript/unicorn/oxc が発火することを確認するテストを scripts に追加
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
既定プラグイン追加後の新規指摘は unicorn 2件のみ。parseStoredNormalizedTags の new Array と corpus の spread を直した。scripts/oxlint-plugins.test.mjs で typescript/unicorn/oxc の意図的違反が発火することを確認。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
plugins に unicorn/typescript/oxc を明示し既定プラグインを戻した。新規 unicorn 指摘2件を修正し、意図的な違反スニペットで3プラグインの検知を回帰テストした。
<!-- SECTION:FINAL_SUMMARY:END -->
