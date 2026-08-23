---
id: TASK-383
title: smokeテストのfixture状態をスコープ化し並列実行を可能にする
status: Done
assignee: []
created_date: '2026-08-21 14:49'
updated_date: '2026-08-23 03:36'
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
- [x] #1 smokeテストがworkers>1(fullyParallel)で全件安定して緑になる
- [x] #2 テスト間の状態干渉を手動で気遣うコメント運用(他のテストが参照しない作品を選ぶ等)が不要になっている
- [x] #3 直列時と並列時のsmoke実行時間を記録し、短縮を確認する
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
FixtureState を単一プロセス共有からworker単位分離＋テストごとリセットへ変更した。

## 干渉箇所
- server/src/adapters/fixture/state.ts の FixtureState はプロセスに1つで、全リクエストがそのまま mutate。作品削除・スキャン取り込み等が後続テストへ持ち越されていた（library.smoke.spec.ts の「他のテストが参照しない作品を使う」コメントが実例）。
- playwright.config.ts は webServer で Bun+Vite を各1プロセスだけ起動し、fullyParallel:false / workers:1 で直列固定していた。

## 設計
- server/src/adapters/fixture/state.ts に resetState() を追加。既存 state オブジェクトへ Object.assign で再初期化した内容を書き戻す（参照を保ったまま各ハンドラのクロージャに影響させる）。
- server/src/adapters/fixture/index.ts で createFixtureAdapter() が resetFixtureState() を DataAdapter に生やす（fixtureのみ実装、real は未実装のまま）。
- server/src/app.ts は adapter.resetFixtureState がある場合のみ POST /api/__test__/reset を生やす（real アダプタでは存在しないルート）。
- client/tests/smoke/fixtures.ts を新規作成。Playwrightのworker-scoped fixtureでworkerごとにBun+Viteサーバーペアを個別ポートで起動し（readinessはADR-0020のログ待ち方式を踏襲、TCPプローブは使わない）、baseURLをworkerごとに差し替え、test-scoped auto fixtureで各テスト前に /api/__test__/reset を叩く。全specファイルの import を "@playwright/test" からこの "./fixtures" へ切り替え。
- playwright.config.ts から webServer / 固定ポート導出を削除し、fullyParallel:true・workers:4 に変更（ポート導出はfixtures.ts側でworkerIndexを含めて行う）。
- 干渉コメント（library.smoke.spec.ts の「他のテストが参照しない作品を使う」）を削除。テスト間のデータ独立が保証されたため不要。

## 並列度の実測根拠（12スレッド機材）
- workers=4: 3回連続 26.9s / 27.0s / 27.2s（全23件green）
- workers=6: 25.4s（個々のテスト所要時間が2〜4s→3〜6sへ増加、リソース競合の兆候）
- workers=8: 25.6s（さらに悪化、6superより改善なし）
- 6・8は4に対して速度がほぼ横ばいなのに個別テストの所要時間が伸びており、他タスクへの悪影響（TASK-393と同種の過剰並列によるタイムアウト）リスクが実利益を上回ると判断し、workers=4を採用。

## 実行時間
- 直列（旧構成、workers:1）: 約52秒（23件）
- 並列（新構成、workers:4）: 約27秒（23件）、3回連続green

## 変更ファイル
- server/src/adapter/index.ts（resetFixtureState? をDataAdapterへ追加）
- server/src/adapters/fixture/state.ts（resetState追加）
- server/src/adapters/fixture/index.ts（resetFixtureStateをadapterへ実装）
- server/src/app.ts（POST /api/__test__/reset）
- client/playwright.config.ts（webServer削除、fullyParallel/workers変更）
- client/tests/smoke/fixtures.ts（新規、worker-scopedサーバー起動＋auto reset fixture）
- client/tests/smoke/*.spec.ts（import先を./fixturesへ変更、library.smoke.spec.tsの干渉コメント削除）

## 検証
- pnpm check: green
- pnpm test: server 715件 / client 846件 全green
- pnpm test:smoke: workers=4で3回連続23件green

## 範囲外で気づいたこと
- ScanJobManager / DlsiteJobManager の履歴（jobs Map・lastCompleted等）はサーバープロセス単位で保持され、FixtureStateのresetでは初期化されない。今回の23件では実害は出ていないが、スキャン系のテストがジョブ履歴の中身自体を厳密にアサートするようになった場合はテスト間で干渉しうる。範囲外のため未対応（起票はしていない、現状無害のため）。
<!-- SECTION:FINAL_SUMMARY:END -->
