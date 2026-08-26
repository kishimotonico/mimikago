---
id: TASK-393
title: serverテストの固定5秒タイムアウトが並列負荷で落ちるのを解消する
status: Done
assignee: []
created_date: '2026-08-23 02:10'
updated_date: '2026-08-26 08:56'
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
- [x] #1 同一のscan/worker系テストが、他に実装エージェントを2本以上並列で動かした状態でも3回連続で緑になる
- [x] #2 対応がタイムアウト値の調整の場合、なぜその値なら足りるのかを負荷をかけた実測で示している
- [x] #3 playwright側のretries:0と同様に、リトライで失敗を隠す対応を取っていない
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## 原因
Bun 1.3.14 の per-test 既定タイムアウトは 5000ms。`bunfig.toml` は無く、`bun test tests --parallel` にも `--timeout` が無かった。加えて scan/worker 系に回数上限付きポーリング（100×10ms 等）があり、CPU飢餓では完了前に打ち切られた。落ちる顔ぶれが入れ替わるのは、並列スケジューリングでどのテストが5秒を超えるかが実行ごとに変わるため。

Bun 1.3 の bunfig `[test]` に timeout キーは無い（公式 parser）。CLI `--timeout` は `package.json` の test スクリプト経由にしか効かず、直接 `bun test tests/real` には効かない。代わりに `[test].preload` から `setDefaultTimeout(30_000)` する。これは node:test API のテストにも効く（7秒 sleep の probe が preload ありで pass、なしだと 5000ms fail）。

## 対応
- `server/bunfig.toml` + `server/tests/preload.ts`: 全テストの runner timeout を 30s（ハング検出。レイテンシSLOではない）
- 回数上限付きポーリングを `pollUntil`（上限なし。ハングは runner に委任）または完了イベント subscribe へ置換
- 短い固定デッドラインを runner と揃えるか撤去（busyTimeout の 6s race 撤去、thumbnailCache 200ms→5s、scanProgress heartbeat の 2s 打ち切り撤去）
- busyTimeout の壁時計アサーションは、Worker の UPDATE 開始（`attempting`）を待ってからロックを 150ms 保持する手順に変更。openDb はロック取得前に済ませる（PRAGMA 待ちでのデッドロック回避）
- リトライは追加していない

## 実測（nproc=12、2026-08-26）

負の対照: preload を外した状態・load ~58 で 48 fail。失敗テストの所要は 5.00〜10.3s に集中し、既定 5000ms が原因であることを確認。

| 条件 | load (1m) | 結果 | スイート所要 | 最遅テスト |
|---|---|---|---|---|
| 静穏 | 0.15 | 715/0 | 12.36s | — |
| yes×8 + 実装エージェント2本 | 11→30 | 715/0 ×3 | 26.65 / 27.48 / 25.89s | — |
| 同上 + yes 追加 | 30→41 | 715/0 | 31.58s | 8.46s |
| yes×56 + エージェント | 47→63 | 715/0 | 48.04s | 12.22s（≥5s が13件） |
| 同上 | 62→71 | 715/0 | 53.83s | 9.11s |
| 同上 | 71→75 | 714/1 | 45.71s | 14.79s。唯一の失敗は busyTimeout の elapsed=98ms（5s timeoutではない） |
| busyTimeout修正後、yes×24 + エージェント2本 | 33→57 | 715/0 ×3 | 39.92 / 38.34 / 39.96s | 10.24 / 10.07 / 8.56s。≥20s は0 |

30s にした根拠: 観測した最遅は 14.79s（load ~75、950件 listSummaries）。20s 超は一度も無く、30s は約2倍の余裕。5s では負荷時に十数件が偽陽性になる。ハングは 30s で検出する。

AC#1 は scan/worker に限らず server スイート全体（715件）を、実装エージェント2本以上＋CPUフィラー並走で3回連続緑とした。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Bun既定5sを bunfig preload の setDefaultTimeout(30s) に置き、回数上限ポーリングを状態到達待ちへ変更。負荷（load 33〜57、エージェント2本）で server 715件を3回連続緑。最遅14.8sのため30sはハング検出器として足りる。
<!-- SECTION:FINAL_SUMMARY:END -->
