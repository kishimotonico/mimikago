---
id: TASK-395
title: fixtureのFilesツリーをタグ由来でなくphysicalPath由来で組み立てる
status: Done
assignee: []
created_date: '2026-08-23 02:37'
updated_date: '2026-08-23 02:49'
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
- [x] #1 buildFsRootの階層名がwork.physicalPathから導出され、tagsを参照しなくなっている
- [x] #2 サークルprefixのハードコードが復活していない
- [x] #3 dlsiteBulkApply.smoke.spec.ts と library.smoke.spec.ts をこの順で実行して緑になる
- [x] #4 pnpm test:smoke のフル実行が緑になる
- [x] #5 TASK-378のworkQueryRepository側の変更が戻っていない
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. physicalPath由来でbuildFsRootを修正 2. smokeテストで検証 3. check/test実行
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
スキャンで新規登録された作品（physicalPathが/library/dlsite/配下でないもの）は引き続き_その他へ寄り、ツリー位置とphysicalPathが一致しない。これは本タスク前からの挙動で、旧実装でもサークルタグが無ければ_その他だったため退行ではない。fixture内部の見た目の問題でテストもユーザーも依存していないため、対応しない判断とした。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
buildFsRootのサークル階層をphysicalPath(library/dlsite/<サークル>/<作品>)から導出。想定外パスは_その他へ。smoke2件・test:smoke・check・test緑。
<!-- SECTION:FINAL_SUMMARY:END -->
