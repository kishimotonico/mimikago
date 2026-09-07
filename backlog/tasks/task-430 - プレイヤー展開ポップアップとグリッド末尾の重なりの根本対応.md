---
id: TASK-430
title: プレイヤー展開ポップアップとグリッド末尾の重なりの根本対応
status: To Do
assignee: []
created_date: '2026-08-01 16:46'
updated_date: '2026-09-07 09:11'
labels:
  - ui
  - layout
  - player
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
プレイヤー展開ポップアップとライブラリ末尾の操作領域が重なり、スマートフォルダーの条件編集やグリッド末尾を操作できない。固定marginの追加ではなく、docked bar・popup・previewを含む実占有領域からスクロール余白を算出する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 スマートフォルダーの条件編集と結果バナーがpopupまたはpreviewに覆われない
- [ ] #2 1280・1440・1920pxで余白が過不足なく、800〜1000pxでは一覧最低幅または全幅overlayへ切り替わる
- [ ] #3 popupのdrag後もviewport外やtopbar上に操作不能な状態で残らない
- [ ] #4 pnpm test:smokeに新規失敗がない
- [ ] #5 プレイヤーpopup展開時もグリッド・リスト末尾の作品と操作へスクロールして到達できる
<!-- AC:END -->
