---
id: TASK-398
title: smokeのworker起動が途中で失敗したときにサーバーを確実に停止する
status: To Do
assignee: []
created_date: '2026-08-23 10:14'
updated_date: '2026-08-23 10:15'
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
- [ ] #1 起動処理(waitForPortFree・spawn・waitForLog・warmUp)のいずれかが失敗しても、起動済みのBun/Viteプロセスが停止される
- [ ] #2 起動失敗を意図的に起こした状態でsmokeを実行し、実行後にポートとプロセスが残らないことを確認している
- [ ] #3 pnpm test:smokeが3回連続で緑
<!-- AC:END -->
