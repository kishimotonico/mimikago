---
id: TASK-381
title: navigationUrlをfeatures/navigationへ移設しナビ状態の購読経路を統一する
status: Done
assignee: []
created_date: '2026-08-21 14:48'
updated_date: '2026-08-23 01:05'
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
- [x] #1 navigationUrl.tsがfeatures/navigation配下にあり、entities/libraryにURL codecが残っていない
- [x] #2 アクションのみ必要な消費者(LibrarySortMenu・LibraryBreadcrumbs等)がuseLibraryNavigation()を購読せず、個別のaction atomを使う
- [x] #3 pnpm check(境界検査含む)とpnpm test:smokeが緑
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. navigationUrl.ts(+test)をentities/library/modelからfeatures/navigation/modelへ移動、import更新\n2. LibrarySortMenu.tsx/LibraryBreadcrumbs.tsxをuseLibraryNavigation()からuseSetAtomによる個別action atom購読へ変更（挙動維持のためstartTransitionは維持）\n3. pnpm check && pnpm test、pnpm test:smoke
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
navigationUrl.ts(+単体テスト)をentities/library/modelからfeatures/navigation/modelへ移設し、URL codecの置き場所をアプリのルーティング契約に合わせた。LibrarySortMenu.tsx・LibraryBreadcrumbs.tsxはuseLibraryNavigation()（4atom分のContext購読）ではなく、setLibrarySortAtom・goToLibrarySegmentAtomの個別action atomをuseSetAtomで直接購読する形に変更（挙動を保つためstartTransitionでラップ）。LibraryView.tsx・WorkDetailPage.tsxは状態とアクション双方を使うため引き続きuseLibraryNavigation()を使用。entities/work・entities/file-systemのnavigationAtomsは変更なし。pnpm check・pnpm test・pnpm test:smoke（23件）すべて緑。
<!-- SECTION:FINAL_SUMMARY:END -->
