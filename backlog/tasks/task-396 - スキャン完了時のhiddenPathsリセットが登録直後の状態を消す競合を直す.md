---
id: TASK-396
title: スキャン完了時のhiddenPathsリセットが登録直後の状態を消す競合を直す
status: Done
assignee: []
created_date: '2026-08-23 03:05'
updated_date: '2026-08-23 03:18'
labels: []
dependencies: []
priority: high
ordinal: 395000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-387で導入したローカル非表示(scanCandidateHiddenPathsAtom)を、統括の指摘でスキャン完了時にリセットするようにした(コミット142c5fb)ところ、smokeのlibrary.smoke.spec.ts:291「スキャン完了後に候補を選択登録でき、問題をFilesで確認できる」が間欠的に落ちるようになった。

切り分けの実測(2026-08-23、TASK-395適用後の統合ブランチ): 素の状態でフルsmokeを3回回すと2〜3回落ちる。142c5fbだけをrevertすると3回とも23件緑。TASK-387の実装コミット(31cc721)ごとrevertしても3回とも緑。よって原因は142c5fbのリセット追加に限定される。

ScanRuntime.tsx の handleScanTerminal は同じ完了ジョブに対して複数回呼ばれうる(SSEの再接続・イベントリプレイ、lastクエリの再観測など)。そのたびに setHiddenPaths(new Set()) が走るため、スキャン完了後にユーザーが候補を登録してhiddenPathsへ積んだ直後に再度リセットが走ると、登録済み候補が一覧へ戻ってしまう。

リセット自体は必要(これが無いと、登録した作品をライブラリから削除して再スキャンしても候補が表示されない)。消すのではなく、同じ完了ジョブで二重に走らないようにするか、リセットの位置をスキャン開始側へ移すか、いずれかで競合を解消する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 handleScanTerminalが同じ完了ジョブで複数回呼ばれてもhiddenPathsが二重にリセットされない（またはリセット位置の変更で同じ効果が得られている）
- [x] #2 TASK-387で入れた「新しいスキャン完了で以前のローカル非表示を破棄する」回帰テストが引き続き緑
- [x] #3 登録した作品をライブラリから削除して再スキャンすると候補が再表示される、という本来の意図が保たれている
- [x] #4 pnpm test:smokeのフル実行を3回連続で緑にする
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. handleScanTerminalの呼ばれ方を計装で実測
2. 実測結果に基づき設計（同一完了ジョブでの二重リセット防止 or リセット位置変更）
3. 実装
4. 既存回帰テスト維持を確認しつつ、二重リセット防止を観測するテストを追加
5. smoke修正前後・check・testを実施
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
原因は「handleScanTerminalが同じ完了ジョブで複数回呼ばれる」ことそのものではなく、useScanJob内のterminalHandled Setによりガード済みだった。実際の競合は、SSE completed イベント受信後の refresh()（GET /scan/:id）が非同期であるため、handleScanTerminal（＝hiddenPathsのリセット）の到達タイミングが不定になり、その到達がユーザーの候補登録（registerMutation.onSuccess の setHiddenPaths）より後になった場合、登録直後のhiddenPaths加算を1回の呼び出しでも巻き戻してしまう、という単発到達の遅延レースだった（console計装でDEBUG_REGISTER_SUCCESS→DEBUG_SCAN_TERMINALの順で1回だけ呼ばれて再現することを確認）。

対処: リセットの位置をスキャン完了側からスキャン開始側（useScanJobのstart()が新規ジョブ起動に成功した直後、onStartコールバック）へ移動。開始はPOSTの応答を待った同期的な処理のため、候補が画面に表示され得るより確実に前のタイミングでリセットが完了し、非同期到達との競合が構造的に発生しなくなる。ScanAlreadyActiveErrorでの再アタッチ時はonStartを呼ばないため、既存スキャンへの再接続では非表示状態を保持する。

変更ファイル: client/src/features/scan/model/useScanJob.ts（onStartオプション追加）、client/src/features/scan/ui/ScanRuntime.tsx（hiddenPathsリセットをhandleScanTerminalからonStartへ移動）、client/tests/unit/runtimeEventSource.test.tsx（TASK-387回帰テストをstart()経由のリセット検証に書き換え、遅延・重複到達しても登録済み非表示を巻き戻さないテストを追加）。

検証: 追加した2テストは旧実装（setHiddenPathsをhandleScanTerminal内に戻す）に対して実際に失敗することを確認済み（negative verification）。pnpm check / pnpm test 全緑。pnpm test:smoke フル実行を3回連続で23件全緑（修正前は library.smoke.spec.ts:291 が単発実行でも100%再現して落ちることを確認済み）。

範囲外の気づき: handleScanTerminal自体は複数回呼ばれてもterminalHandledで既にガードされており、今回のAC#1「二重リセットされない」は「リセット位置の変更で同じ効果」の側で満たしている。
<!-- SECTION:FINAL_SUMMARY:END -->
