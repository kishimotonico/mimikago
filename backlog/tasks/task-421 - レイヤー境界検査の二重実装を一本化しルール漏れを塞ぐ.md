---
id: TASK-421
title: レイヤー境界検査の二重実装を一本化しルール漏れを塞ぐ
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:57'
updated_date: '2026-08-29 18:08'
labels: []
dependencies: []
priority: medium
ordinal: 420000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
同一のレイヤー境界ポリシー（features間sibling禁止、routes→adapters禁止など）が、.oxlintrc.json の no-restricted-imports overrides と scripts/check-layer-boundaries.mjs の2箇所に別実装され、既に片方にしか無い禁止則の乖離が生じている。単一の正から両方を導出するか、片方へ一本化して不足ルールを補完する。注意: oxlintのoverrides[].filesは**/形式必須（複数セグメントの相対パスはsilentに無効化される。docs/ARCHITECTURE.md記載）。2026-08-28の全体監査で発見。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 境界ルールの正が1箇所になる（一本化、または単一定義からの生成）
- [x] #2 現在の両実装の差分（どちらかにしか無いルール）が洗い出され、補完される
- [x] #3 意図的な違反コードで各ルールの検知が働くことを確認する
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
境界ルールの正を scripts/layer-boundary-rules.mjs に置き、check-layer-boundaries.mjs と oxlint overrides をそこから導出する。差分は features sibling が oxlint 側に無く、routes 禁止が adapters 全体か real/fixture 分割か。sibling を oxlint へ補完し、意図的な違反コードで各ルールを確認する。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
正は scripts/layer-boundary-rules.mjs。check-layer-boundaries.mjs と oxlint overrides（node scripts/sync-oxlint-layer-overrides.mjs）がそこから導出される。
洗い出した差分:
- features sibling はスクリプトのみ → oxlint の feature 単位 override へ補完
- routes 禁止はスクリプトが adapters 全体、oxlint は real/fixture 分割 → adapters 全体に統一
- oxlint は同じ files glob が後勝ちなので、core の2則と features→app を sibling と同じエントリへマージ
- App.tsx の Jotai 制限はレイヤー境界ではないので手書きのまま
- oxlint は動的 import を no-restricted-imports で見ない。動的 import は境界スクリプトが担当
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
レイヤー境界ルールの正を scripts/layer-boundary-rules.mjs に置き、境界スクリプトと oxlint overrides をそこから導出した。sibling 禁止を oxlint へ補完し、意図的な違反コードで各ルールを確認した。
<!-- SECTION:FINAL_SUMMARY:END -->
