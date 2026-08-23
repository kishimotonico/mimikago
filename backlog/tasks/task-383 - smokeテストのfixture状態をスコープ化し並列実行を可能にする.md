---
id: TASK-383
title: smokeテストのfixture状態をスコープ化し並列実行を可能にする
status: To Do
assignee: []
created_date: '2026-08-21 14:49'
updated_date: '2026-08-23 00:45'
labels: []
dependencies: []
priority: medium
ordinal: 383000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。fixtureアダプタはプロセスに1つのFixtureState(server/src/adapters/fixture/state.ts:50)を全リクエストがmutateする設計で、playwright.config.ts:23-24が明示コメント付きでworkers:1・fullyParallel:falseに固定している(現状6ファイル23テスト直列)。smokeはUI変更の受け入れ条件なのでケース数は増える一方で、「テストは網羅性より実行速度」方針と正面衝突していく。worker単位で独立サーバー(またはFixtureState)を持つ、テストごとに状態を生成し直せるようにする等で、状態をプロセス単位から切り離す。ケースが今より増える前に実施したい。

実装上の注意: playwright.config.tsのポート導出(worktreeパスsha256→4200〜4699)を壊さない。未使用ポート接続が約2分ハングするWSL既知障害があるため(ADR-0020)、readiness待ちはwebserverログwait方式を維持しポーリング接続方式にしない。retries:0を維持する(リトライで不具合を隠さない方針)。並列化後は全smokeを3回連続で緑にしてから完了とする。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 smokeテストがworkers>1(fullyParallel)で全件安定して緑になる
- [ ] #2 テスト間の状態干渉を手動で気遣うコメント運用(他のテストが参照しない作品を選ぶ等)が不要になっている
- [ ] #3 直列時と並列時のsmoke実行時間を記録し、短縮を確認する
<!-- AC:END -->
