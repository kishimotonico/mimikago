---
id: TASK-378
title: circleNameのSQL独自実装を廃止しshared関数へ一本化する
status: To Do
assignee: []
created_date: '2026-08-21 14:48'
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
- [ ] #1 workQueryRepositoryのcircleNameMap(SQL LIKE実装)が削除され、一覧のcircleNameはtagMap+extractCircleNameで算出される
- [ ] #2 fixtureのbuildFsRootのサークルprefixハードコードがshared関数利用に置き換わる
- [ ] #3 契約テストのcircleName検証(worksQueryContract.test.ts:264-276)が引き続き緑
- [ ] #4 ADR-0008のSQL例外は3件のまま増えていない
<!-- AC:END -->
