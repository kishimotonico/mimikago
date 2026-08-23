---
id: TASK-381
title: navigationUrlをfeatures/navigationへ移設しナビ状態の購読経路を統一する
status: To Do
assignee: []
created_date: '2026-08-21 14:48'
labels: []
dependencies: []
priority: medium
ordinal: 381000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘の軽量版(Codexレビュー反映)。(1)entities/library/model/navigationUrl.ts(237行)はlibrary/files/nowPlaying/workDetail全モードのURL parse/serializeを持ち、libraryのドメイン知識ではなくアプリのルーティング契約になっている。importしているのはfeatures/navigation/model/useNavigationHistory.tsの1箇所だけなので、features/navigation配下へ移設する(新しいrouting層は作らない。単一codecを保つ)。entities/work・entities/file-systemのnavigationAtomsは共有状態の正規置き場なので動かさない。(2)libraryナビ状態の購読が「直接atom購読」と「useLibraryNavigation()のContext経由」の2経路併存で規約がない。LibrarySortMenu.tsx:39-41とLibraryBreadcrumbs.tsx:4,12はアクション1つのためにContext(4atom分の購読)を呼んでおり、無関係な状態変化で再レンダーされる。アクションのみ必要な消費者はuseSetAtom個別購読へ統一し、Contextは状態・アクション双方を使う箇所に限定する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 navigationUrl.tsがfeatures/navigation配下にあり、entities/libraryにURL codecが残っていない
- [ ] #2 アクションのみ必要な消費者(LibrarySortMenu・LibraryBreadcrumbs等)がuseLibraryNavigation()を購読せず、個別のaction atomを使う
- [ ] #3 pnpm check(境界検査含む)とpnpm test:smokeが緑
<!-- AC:END -->
