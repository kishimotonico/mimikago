---
id: TASK-379
title: データルート解決の実装をserver側へ一本化しdev-real.mjsの重複を解消する
status: To Do
assignee: []
created_date: '2026-08-21 14:48'
labels: []
dependencies: []
priority: medium
ordinal: 379000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。OS別データルート規則(ADR-0007)がserver/src/adapters/real/dataRoot.ts:11-23とscripts/dev-real.mjs:26-36(resolveProductionRoot)に独立実装されている。片方だけ変更するとworktree検証が本番DBを共有する事故(過去task-215と同根)が再発しうる。dataRoot.tsはnode:os/node:pathのみ依存でBun固有APIを使っていないため、Node 24のtype-strippingでdev-real.mjsから直接importする一本化を第一候補にする。importが成立しない場合の代替は、両者の出力一致を検証するテストの追加。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 データルート解決の実装が1箇所になる(またはdev-real.mjsとdataRoot.tsの出力一致テストが同一入力ケース群で通る)
- [ ] #2 Windows/Linux両方のパス規則、MIMIMILLI_DATA_DIR明示指定、linked worktree自動分離の各ケースが検証されている
- [ ] #3 dev:realの起動挙動(本番/worktreeのデータルート選択)が従来と一致する
<!-- AC:END -->
