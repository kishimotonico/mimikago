---
id: TASK-385
title: WorkQueryRepositoryから検索契約外の関心事を移設する
status: Done
assignee: []
created_date: '2026-08-21 14:49'
updated_date: '2026-08-23 01:55'
labels: []
dependencies: []
priority: low
ordinal: 385000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘の軽量版(Codexレビューで「全分割は過剰、検索契約から明確に外れるものだけ移す」に調整)。server/src/adapters/real/workQueryRepository.ts(767行)に9種以上の読み取り関心事が同居し、機能追加のたびに肥大化している(2026-08-09の分割後も8-10〜8-21で継続増加)。ADR-0008のSQL例外(検索・ファセット・DLsite通知)と無関係な、スキャン状態取得(getScanWorkMap)・probeキャッシュ参照(fetchProbeCache)・メディア/カバー位置取得(getCoverLocation/getMediaRoot)を用途別モジュールへ移し、公開facadeは維持する。検索・ファセット・通知集計の分割はしない。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 スキャン状態・probeキャッシュ・メディア/カバー位置の取得がworkQueryRepository.tsから用途別モジュールへ移っている
- [x] #2 queryWorks/getAxisFacets/DLsite通知集計は現行のまま(契約テスト緑)
- [x] #3 pnpm test:serverが緑
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 用途別モジュール作成(scan/probe/media) 2. WorkQueryRepositoryをfacade化 3. テスト・負の検証 4. pnpm check/test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
getScanWorkMap→scanWorkQueries.ts、fetchProbeCache→probe.ts、getCoverLocation/getMediaRoot/hasTrackFile→workMediaQueries.tsへ移設。WorkQueryRepositoryはfacade委譲のみ。hasTrackFileはメディア配信照合の関心事のためworkMediaQueriesへ同梱。pnpm check/test緑。
<!-- SECTION:FINAL_SUMMARY:END -->
