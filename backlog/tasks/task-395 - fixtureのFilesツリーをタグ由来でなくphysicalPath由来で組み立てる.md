---
id: TASK-395
title: fixtureのFilesツリーをタグ由来でなくphysicalPath由来で組み立てる
status: To Do
assignee: []
created_date: '2026-08-23 02:37'
updated_date: '2026-08-23 02:37'
labels: []
dependencies: []
priority: high
ordinal: 394000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-378でfixtureのbuildFsRootのサークルprefixハードコードをshared関数(extractCircleName)へ置き換えた結果、/fsツリーの階層名がタグ由来になり、smokeテスト2件が決定的に落ちるようになった。

再現と切り分け(2026-08-23): client/tests/smoke の dlsiteBulkApply.smoke.spec.ts と library.smoke.spec.ts をこの順で実行すると library.smoke.spec.ts:291 と :335 が落ちる。library単独実行では緑。TASK-381時点(df718b0)では緑、TASK-378取り込み後(9d5f32f)から赤。

原因: fixtureのDLsite適用(dlsiteMethods.ts)が 'サークル/fixtureサークル' を追加するため、作品が 'サークル/夜想曲スタジオ' と 'サークル/fixtureサークル' の2つを持つ状態になる。旧実装は配列順の先頭('夜想曲スタジオ')を採っていたが、extractCircleNameはcompareUtf8Bytes昇順の先頭を採るため 'fixtureサークル' が選ばれ、/fsツリーの階層名が変わって作品を辿れなくなる。

本質的な問題は、物理ファイラーであるべきFilesツリーの階層を、可変なタグから導出していること。fixtureの全作品のphysicalPathは '/library/dlsite/<サークル>/<作品フォルダー>' 形式(_その他を含む)なので、physicalPathから導出すればタグ依存もprefixハードコードも消え、ツリーとphysicalPathが構成上一致する。extractCircleNameは一覧のcircleName算出用であり、物理配置の決定には使わない。

TASK-378のworkQueryRepository側の変更(SQL独自実装の廃止)は正しいので戻さないこと。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 buildFsRootの階層名がwork.physicalPathから導出され、tagsを参照しなくなっている
- [ ] #2 サークルprefixのハードコードが復活していない
- [ ] #3 dlsiteBulkApply.smoke.spec.ts と library.smoke.spec.ts をこの順で実行して緑になる
- [ ] #4 pnpm test:smoke のフル実行が緑になる
- [ ] #5 TASK-378のworkQueryRepository側の変更が戻っていない
<!-- AC:END -->
