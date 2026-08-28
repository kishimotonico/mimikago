---
id: TASK-402
title: スキャン候補プールとroot設定の世代不一致による誤登録を防ぐ
status: Done
assignee: []
created_date: '2026-08-26 10:40'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - server/src/adapters/real/scanCandidateSession.ts
  - server/src/adapters/real/settingsScanMethods.ts
priority: medium
ordinal: 401000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。ScanCandidateSession は候補 pool だけを保持し、生成時の root を持たない（scanCandidateSession.ts:11-21）。登録時は現在の root と旧 pool の相対 path を resolve(root, current.path) する（:54-57）。

スキャン後に PUT /settings で root を変えてから候補登録すると、別 root の同名パスへ誤登録し得る。exclusions も root で名前空間されていない。プールに root の指紋を持たせ、現行 root と違えば CandidatePoolChangedError にする。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 候補プール生成時のrootと現行rootが違う状態で登録しようとすると CandidatePoolChangedError（または同等の409）になり、別rootへ登録されない
- [x] #2 rootを変えていない通常の登録・除外は従来どおり成功する
- [x] #3 上記を観測するテストがあり、修正を戻すと落ちる
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. プールにroot指紋を持たせ登録・除外前に現行rootと照合 2. root変更後の誤登録テストと負の検証 3. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
候補プールにroot指紋を持たせ、現行rootと違えばCandidatePoolChangedError。scanCandidates.test.tsで負の検証済み。
<!-- SECTION:FINAL_SUMMARY:END -->
