---
id: TASK-397
title: 候補再取得のdedupeが状態変更をまたいで古いプールを確定させるのを直す
status: Done
assignee: []
created_date: '2026-08-23 10:14'
updated_date: '2026-08-23 10:34'
labels: []
dependencies: []
priority: medium
ordinal: 396000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Codexレビュー(2026-08-23、7e9dae2..c775489)の指摘。TASK-387で refreshScanCandidates が queryClient.fetchQuery ベースになった結果、同一キーの実行中フェッチが1本に集約される(dedupe)。再取得が飛んでいる最中にもう一度呼ぶと新しい要求は発行されず、古い要求の結果がキャッシュ値として確定する。候補クエリは enabled:false なので、あとから自動で取り直されることもない。

問題は、状態が変わる境界(スキャン完了、候補の登録・除外、除外の復元)をまたいでdedupeすると、変わる前のサーバー状態が確定してしまう点。呼び出し元は client/src/features/scan/ui/ScanRuntime.tsx:34、ScanModal.tsx:78(いずれもvoidの投げっぱなし)、scanModal/UnregisteredTab.tsx:74・101、features/settings/ui/ExcludedFoldersSettings.tsx:44 の5箇所あり、重なる余地がある。

これはTASK-387で廃止した手製issued/appliedシーケンス番号が担っていた役割の一部。あの時の整理は「サーバーデータとローカル編集を別ストレージに分けたので競合が構造的に起きない」で、ローカル編集が巻き戻る方向については正しかったが、古いサーバー応答が新しい状態を上書きする方向は残っていた。

状態変更後の再取得は、先行する実行中リクエストとdedupeさせず、キャンセルまたは追い越す形にする。scanCandidatesCache.ts のコメントもdedupeを意図として明記しているので、あわせて更新すること。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 スキャン完了・候補の登録/除外・除外の復元のあとに呼ぶ再取得が、先行する実行中リクエストの結果で確定しない
- [x] #2 先行リクエストが実行中の状態で状態変更後の再取得を行うと新しいサーバー状態が反映されることを観測するテストがあり、修正を戻すと落ちる
- [x] #3 scanCandidatesCache.tsのコメントが修正後の挙動と一致している
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. refreshScanCandidatesのdedupe問題を修正 2. 並行再取得テスト追加 3. 負の検証 4. pnpm check/test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
refreshScanCandidatesはqueryCache.buildで実行中フェッチを検出しquery.cancel後にfetchQuery。打ち切られた呼び出しはgetQueryDataで即返却（手製subscribeなし）。モジュールスコープの世代カウンタは廃止。並行再取得テストはcallCount=2とキャッシュ最終値candidateBを観測、旧fetchQueryのみ実装ではcallCount=1で失敗。pnpm check/test緑。
<!-- SECTION:FINAL_SUMMARY:END -->
