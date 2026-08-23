---
id: TASK-398
title: smokeのworker起動が途中で失敗したときにサーバーを確実に停止する
status: Done
assignee: []
created_date: '2026-08-23 10:14'
updated_date: '2026-08-23 10:23'
labels: []
dependencies: []
priority: high
ordinal: 397000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Codexレビュー(2026-08-23、7e9dae2..c775489)の指摘。client/tests/smoke/fixtures.ts のworker-scoped fixtureは、waitForPortFree・waitForLog・warmUp をすべて use() より前で実行し、shutdown は use() の後にしか置いていない。起動途中でthrowすると shutdown へ到達せず、detached:true で起動したBun/Viteが決定的ポートを掴んだまま残る。

残ったプロセスは次の実行や他のworkerのbindを阻害する。実際、TASK-383の検証中に『起動ログを待つ前にプロセスが終了しました (code 1)』が4 worker同時に発生する事象を繰り返し踏んでおり、同じ系統の失敗を再生産する経路になっている。

起動処理と use() の両方を覆う finally でプロセスの停止を行う。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 起動処理(waitForPortFree・spawn・waitForLog・warmUp)のいずれかが失敗しても、起動済みのBun/Viteプロセスが停止される
- [x] #2 起動失敗を意図的に起こした状態でsmokeを実行し、実行後にポートとプロセスが残らないことを確認している
- [x] #3 pnpm test:smokeが3回連続で緑
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. fixtures.ts に try/finally で起動失敗時も shutdown 2. 負の検証（意図的失敗→ポート/プロセス確認）3. test:smoke 3回・check/test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
worker-scoped fixture を try/finally で囲み、起動途中の失敗時も spawn 済みの Bun/Vite を shutdown するよう修正。負の検証で waitForLog パターン不一致時にポート・プロセスが残らないことを確認。test:smoke 3回連続・pnpm check・pnpm test 緑。
<!-- SECTION:FINAL_SUMMARY:END -->
