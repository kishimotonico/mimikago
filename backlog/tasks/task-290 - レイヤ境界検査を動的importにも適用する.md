---
id: TASK-290
title: レイヤ境界検査を動的importにも適用する
status: Done
assignee: []
created_date: '2026-08-09 20:44'
updated_date: '2026-08-23 02:13'
labels: []
dependencies: []
priority: medium
ordinal: 300000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-282で導入したレイヤ境界の機械的検証に、動的importのすり抜けがある。

scripts/check-layer-boundaries.mjs の collectImports は正規表現ベースで import("...") 形式（ImportExpression）を収集せず、oxlint の no-restricted-imports も静的import宣言のみが対象。そのため禁止依存（features間sibling、shared→features等）を動的importへ書き換えるだけで両方の検査を通過できる。現状のコードベースに違反はゼロで実害はないが、境界固定の趣旨からすると塞ぐ価値がある。

対応案: collectImports の正規表現に import( 形式を追加するか、境界スクリプトをAST解析（oxc-parser等）へ置き換えてImportExpressionも対象にする。

アーキテクチャ監査(2026-08-21)の追記: 違反を実際に仕込んだ実測で、oxlint側も動的importを検出しないことを確認した(両検査とも同じ盲点)。lazy動的importが既に3箇所で実運用されているため優先度をMEDIUMへ変更。現状が文字列リテラルの動的importのみの間は、AST化より正規表現へのimport("...")収集追加+陽性/陰性テストで足りる。対応時は境界スクリプト側を検査の単一の正とする。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 layer跨ぎの動的importが check-layer-boundaries.mjs で検出されること
- [x] #2 検出の実効性が違反を仕込んだ確認（テストまたは記録された手動確認）で担保されていること
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. collectImports に import() 収集を追加 2. 陽性/陰性の検証 3. pnpm check && pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
collectImports に import() 文字列リテラル収集を追加し、node:test による陽性/陰性テストを check 先頭で実行するよう組み込んだ。既存の lazy 動的 import 3箇所（app→features）は禁止方向ではないため誤検出なし。pnpm check・pnpm test 緑。
<!-- SECTION:FINAL_SUMMARY:END -->
