---
id: TASK-377
title: core↔SQL契約テストの検知漏れ3点を塞ぐ
status: To Do
assignee: []
created_date: '2026-08-21 14:48'
updated_date: '2026-08-23 00:45'
labels: []
dependencies: []
priority: high
ordinal: 377000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。ADR-0008が要求する契約テストに検知できない穴が3つある。(1)軸ファセットのcovers選定: server/tests/real/worksQueryContract.test.ts:66のdatasetが全作品cover:null固定のため、covers同値性の比較が常に空配列同士で空振り。さらにcore側(core/axisFacets.ts:61-64)のソートはaddedAt比較のみでタイブレークがなく、SQL側(workQuerySql.ts:207-226)はwork_id ASCで決着するため、addedAt同値時に並びが乖離しうる。(2)viewフィルタ: 同テストでsortはsortIdSchema.optionsから自動列挙するのにviewは手書き配列(216行目)。core/worksQuery.ts:130-148とworkQuerySql.ts:180-202は両方とも未知値を黙ってフィルタなしで素通しするため、新ViewId追加時の対応漏れを型もテストも検知しない。(3)スマートフォルダー長さルール: Number.isFinite検証とエラーメッセージがcore/smartFolder.ts:41-44とworkQuerySql.ts:259-262に文字単位で複製されている。長さ値を検証して数値を返す小関数だけを共有すればよく、ルール評価全体の抽象化は不要。

実装上の注意(ADR-0008): 契約テストが反例を出した場合、SQL結果に合わせて期待値を緩めることは禁止。core契約とSQLのどちらが誤りかを決めて両方を同時に直し、判断に迷う場合は統括へ相談する。assertNeverは既存コードベースに網羅チェックの書き方があればそれに合わせる。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 契約テストのdatasetにcoverあり・addedAt同値の作品が含まれ、facet同値性テストがcovers配列の中身と順序まで比較している
- [ ] #2 coreのcovers選定にwork_id ASCのタイブレークが入り、SQL側と同順になる(検証は契約テストで行う)
- [ ] #3 契約テストのviews列挙がviewIdSchema.optionsから生成されている
- [ ] #4 filterByViewとviewConditionsのswitchが網羅チェック(assertNever相当)を持ち、ViewId追加時に型エラーになる
- [ ] #5 長さルールの検証関数がcore単一実装になり、workQuerySql.tsはそれをimportして使う
<!-- AC:END -->
