---
id: TASK-428.23
title: ポップオーバーの閉じ方とPointer dragの主ボタン判定を統一する
status: To Do
assignee: []
created_date: '2026-09-07 09:09'
labels:
  - ui
  - interaction
  - player
dependencies: []
modified_files:
  - client/src/shared/ui/TagCombobox.tsx
  - client/src/features/player/ui/PopupContent.tsx
parent_task_id: TASK-428
priority: medium
ordinal: 450000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
VIS-04、interaction-model-B-06。TagComboboxと速度menuが共通dismissal規約から外れ、player dragが右・中央ボタンも開始として扱いうる。outside press/focus/scroll/Escapeと主ボタン判定を揃える。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TagComboboxと速度menuが外側クリック・focus移動・scroll・Escapeで閉じる
- [ ] #2 候補選択・速度選択・矢印キー操作を維持する
- [ ] #3 seek・AB・popup dragはmouse主ボタンだけで開始する
- [ ] #4 右・中央クリックの標準動作を妨げない
- [ ] #5 pnpm test:smokeに新規失敗がない
<!-- AC:END -->
