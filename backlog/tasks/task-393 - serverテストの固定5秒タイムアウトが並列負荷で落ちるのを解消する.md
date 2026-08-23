---
id: TASK-393
title: serverテストの固定5秒タイムアウトが並列負荷で落ちるのを解消する
status: To Do
assignee: []
created_date: '2026-08-23 02:10'
updated_date: '2026-08-23 02:10'
labels: []
dependencies: []
priority: medium
ordinal: 393000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ負債改修(TASK-376〜392)の作業中に判明。scan/worker系のserverテストが、マシンに他の負荷がかかっている状態で5000msのタイムアウトにより落ちる。落ちる顔ぶれは実行ごとに入れ替わり、機械が静かなときは緑になる。

切り分けの実測(同一の3ファイル tests/real/scanCandidates.test.ts・tests/real/scanWorker.test.ts・tests/transport/shutdown.test.ts を繰り返し実行): master(7e9dae2)で4/4緑、統合ブランチの388直前(61c668c)で4/4緑、388を含む状態で最初1/3失敗、その後マシンが静かになってから5/5緑。特定のコミットとは相関せず、CPU競合とのみ相関する。実装エージェントを4〜5本並列で動かすとload averageが60を超え、その状態では26件規模で落ちた。

実害は「並列で実装を進めると検証結果が信用できなくなり、切り分けに時間を取られる」こと。マルチエージェント運用を続ける限り再発する。テスト側の固定タイムアウトを実行環境の負荷に耐える値にするか、負荷に依存しない待ち方へ変えるかを検討する。リトライで隠す対応は取らないこと(不具合を隠す方針に反する)。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 同一のscan/worker系テストが、他に実装エージェントを2本以上並列で動かした状態でも3回連続で緑になる
- [ ] #2 対応がタイムアウト値の調整の場合、なぜその値なら足りるのかを負荷をかけた実測で示している
- [ ] #3 playwright側のretries:0と同様に、リトライで失敗を隠す対応を取っていない
<!-- AC:END -->
