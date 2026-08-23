---
id: TASK-378
title: circleNameのSQL独自実装を廃止しshared関数へ一本化する
status: Done
assignee: []
created_date: '2026-08-21 14:48'
updated_date: '2026-08-23 01:46'
labels: []
dependencies: []
priority: medium
ordinal: 378000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。realのworkQueryRepository.ts:102-124のcircleNameMapが、shared/src/work.ts:217のextractCircleNameと同じサークル名抽出規則をSQL LIKE句で独自に再実装している。これはADR-0008の例外表(認可済み3件)に無い未登録のcore↔SQL二重実装であり、ADR-0005「コードに特定prefixの分岐を書かない」の観点でも分岐箇所が増えている。queryWorks(同417行付近)はページ分のworkIdsを既に持ち、既存のtagMapでタグを引けるため、SQL実装をやめてextractCircleNameをJS側で適用するだけで解消できる。fixtureのdata.ts:485-486(buildFsRoot)にも同じprefixハードコードが独立に存在するので、あわせてshared関数利用へ寄せる。tag_prefixes設定から代表prefixを選ぶ汎用機構化は行わない(Codexレビューで仕様が曖昧になると指摘、タグ横断リネーム機能の設計時に再検討)。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 workQueryRepositoryのcircleNameMap(SQL LIKE実装)が削除され、一覧のcircleNameはtagMap+extractCircleNameで算出される
- [x] #2 fixtureのbuildFsRootのサークルprefixハードコードがshared関数利用に置き換わる
- [x] #3 契約テストのcircleName検証(worksQueryContract.test.ts:264-276)が引き続き緑
- [x] #4 ADR-0008のSQL例外は3件のまま増えていない
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. workQueryRepositoryのcircleNameMap削除・tagMap+extractCircleNameへ置換 2. fixture buildFsRootをshared関数利用へ 3. 契約テスト・pnpm check/testで検証
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
workQueryRepositoryのcircleNameMap(SQL LIKE)を削除しtagMap+extractCircleNameへ一本化。fixture buildFsRootもextractCircleName利用へ。契約テスト・pnpm check/test緑。
<!-- SECTION:FINAL_SUMMARY:END -->
