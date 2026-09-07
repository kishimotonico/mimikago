---
id: TASK-428.12
title: 作品・値・トラック一覧のキーボード操作を共通化する
status: To Do
assignee: []
created_date: '2026-09-07 09:08'
labels:
  - ui
  - keyboard
  - accessibility
dependencies: []
modified_files:
  - client/src/features/library/ui/WorkListPane.tsx
  - client/src/features/library/ui/WorkGrid.tsx
  - client/src/features/library/ui/preview/WorkTrackList.tsx
parent_task_id: TASK-428
priority: high
ordinal: 439000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
responsive-keyboard-A-01/A-02とinteraction-model重複。大量の行が個別Tab-stopとなり、一覧ごとに矢印・Enter・Escapeの意味が異なる。roving tabindexと仮想化focus処理を共通化する。Files一覧はDRAFT-51の範囲として除く。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 各一覧へTab一回で入り、Tab一回で次の領域へ離脱できる
- [ ] #2 上下・グリッド左右・Home・Endで項目間を移動できる
- [ ] #3 仮想化された項目へ移動後に表示とfocusが一致する
- [ ] #4 Enterの主操作とEscapeの選択解除が一覧種別ごとの仕様どおり動く
- [ ] #5 pnpm test:smokeに新規失敗がない
<!-- AC:END -->
