---
id: TASK-387
title: scanのローカル編集状態をqueryClient手製ストアからJotaiへ移す
status: To Do
assignee: []
created_date: '2026-08-21 14:50'
labels: []
dependencies: []
priority: low
ordinal: 387000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。他のfeatureは「サーバー状態=TanStack Query、クライアント状態=Jotai」の二層で一貫しているが、scanだけが承認/除外のローカル編集状態までqueryClient.setQueryDataを手製KVストアとして使い(entities/scan/scanCandidatesCache.ts:5-58の手製issued/appliedシーケンス番号)、useSyncExternalStore+getQueryCache().subscribe+JSON.stringifyキー比較という独自購読(features/scan/model/useScanCandidatesCache.ts:16-53)を実装している。まだ他へ拡散していないうちに標準パターンへ寄せる。サーバー由来の候補データはQueryのまま、ユーザーのローカル編集分をJotai atomへ分離する方向。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 scanCandidatesCacheの手製シーケンス番号とuseSyncExternalStore購読が廃止されている
- [ ] #2 承認/除外のローカル編集状態がJotai atom(または標準のQuery経路)で管理される
- [ ] #3 スキャンモーダルの候補承認・除外・登録の挙動が従来どおり(pnpm test:smokeが緑)
<!-- AC:END -->
