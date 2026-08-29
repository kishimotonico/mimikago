---
id: TASK-412
title: getAxisFacetsがversion欠落のcoverを返しクライアントの軸ファセット取得が失敗するのを直す
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:55'
updated_date: '2026-08-29 17:15'
labels: []
dependencies: []
priority: high
ordinal: 411000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
server/src/adapters/real/workQueryRepository.ts:571-576 の getAxisFacets は、facetCoverVersions が statCoverSource 失敗（スキャン後にカバー実体が削除・移動された等）の workId を versions Map に登録しないまま、非nullアサーションで version を組み立てるため、version が undefined の cover が実際に生成される。routes/axes.ts はレスポンスを axisFacetListSchema で検証せず返すので、JSON化で version キーが欠落し、クライアントの getParsed が ApiResponseSchemaError を投げてその軸の値一覧（タグレール・年別ファセット等）の取得全体が失敗する。同ファイルの coverDtoFromColumns は stat 失敗時に cover 自体を除外する規約であり、facetCoverVersions だけが規約を破っている。2026-08-28の全体監査で発見・検証済み（confirmed）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 stat失敗した作品のcoverがファセット結果から除外される（coverDtoFromColumnsの規約と一致する挙動）
- [x] #2 カバー実体が存在しないケースの回帰テストがrealアダプタ経路にある
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. getAxisFacets で version が取れない cover を除外する（coverDtoFromColumns と同じ規約） 2. real アダプタ経路の回帰テストを coverDto.test.ts に追加（欠損カバー除外・実体ありカバーの version 付与・axisFacetListSchema で検証）
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
bun test tests/real/coverDto.test.ts が 2 pass。欠損カバーは covers から除外し、実体ありカバーは version 付きで残り、axisFacetListSchema で検証できる。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
getAxisFacets が stat 失敗の cover に undefined version を付けていたのを、coverDtoFromColumns と同じく除外するよう直した。real 経路の回帰テストで欠損カバー除外と実体ありカバーの version 付与を確認した。
<!-- SECTION:FINAL_SUMMARY:END -->
