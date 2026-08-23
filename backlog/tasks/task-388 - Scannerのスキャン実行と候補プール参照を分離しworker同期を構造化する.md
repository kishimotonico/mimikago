---
id: TASK-388
title: Scannerのスキャン実行と候補プール参照を分離しworker同期を構造化する
status: Done
assignee: []
created_date: '2026-08-21 14:50'
updated_date: '2026-08-23 01:52'
labels: []
dependencies: []
priority: low
ordinal: 388000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。本番のファイルDB経路ではフルスキャンをscanWorker.ts:44-59内の別インスタンス一式(Db・DlsiteCache・リポジトリ・Scanner)が実行し、メインスレッド側Scannerへはscanner.seedCandidatePool(candidatePool)という単一フィールドの手動コピー(settingsScanMethods.ts:108-121)だけで結果を反映している。Scannerに可変状態を足すたびにこの暗黙の同期経路(どこにも文書化されていない)を知らないと、メインスレッド側だけ古い状態を返す不整合が静かに起きる。「スキャン実行」と「スキャン結果に基づく候補の参照・登録・除外」を分離し、worker実行結果は結果オブジェクト全体の置き換えとしてメインスレッド常駐側へ渡す形にする。あわせてworker分離の意図(フル走査でイベントループを塞がない)をコード近傍かARCHITECTURE.mdに一言残す。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 メインスレッド常駐の候補参照が、フィールド単位の手動コピーでなくworker実行結果オブジェクトの置き換えで更新される
- [x] #2 seedCandidatePoolパターン(単一フィールド手動同期)が廃止されている
- [x] #3 scanner系の結合テストが緑
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 現状の同期経路とメインスレッド側状態を洗い出す 2. スキャン実行と候補参照を分離する設計 3. seedCandidatePool廃止・結果オブジェクト置換で同期 4. テスト・ARCHITECTURE更新 5. pnpm check/test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
スキャン実行(Scanner.scan→ScanExecutionResult)と候補参照(ScanCandidateSession)を分離。worker完了時はScanExecutionResultを丸ごと受け取りcandidateSessionをインスタンス置換。seedCandidatePool/getCandidatePool/lastCandidatePoolを廃止。ARCHITECTURE.mdにworker分離の意図を追記。pnpm check・pnpm test(713+843)緑。
<!-- SECTION:FINAL_SUMMARY:END -->
