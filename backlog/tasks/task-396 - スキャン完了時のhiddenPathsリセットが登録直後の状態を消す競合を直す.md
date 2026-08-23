---
id: TASK-396
title: スキャン完了時のhiddenPathsリセットが登録直後の状態を消す競合を直す
status: To Do
assignee: []
created_date: '2026-08-23 03:05'
updated_date: '2026-08-23 03:05'
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
- [ ] #1 handleScanTerminalが同じ完了ジョブで複数回呼ばれてもhiddenPathsが二重にリセットされない（またはリセット位置の変更で同じ効果が得られている）
- [ ] #2 TASK-387で入れた「新しいスキャン完了で以前のローカル非表示を破棄する」回帰テストが引き続き緑
- [ ] #3 登録した作品をライブラリから削除して再スキャンすると候補が再表示される、という本来の意図が保たれている
- [ ] #4 pnpm test:smokeのフル実行を3回連続で緑にする
<!-- AC:END -->
