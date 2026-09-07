---
id: TASK-428
title: UI/UX監査で確認した改善を実装する
status: To Do
assignee: []
created_date: '2026-09-07 09:04'
updated_date: '2026-09-07 09:17'
labels:
  - ui
  - ux
  - audit
dependencies: []
references:
  - tmp/uiux-audit-2026-09-04/HANDOFF.md
  - tmp/uiux-audit-2026-09-04/VALIDATION.md
priority: high
ordinal: 427000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-09-04のUI/UX監査318件を現masterで再検証し、重複・対象外・fixture由来を除いた改善を実装するための親タスク。子タスクは領域ごとに独立したPRで完了できる粒度に分ける。判断が必要な事項と既存ドラフト重複は新規実装タスクに含めない。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 high/P1の子タスクがすべて完了している
- [ ] #2 各UI変更でpnpm test:smokeに新規失敗がない
- [ ] #3 既存DRAFTと重複する所見は対応先が記録されている
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
既存課題対応: TASK-429（旧DRAFT-42）へFiles祖先表示、TASK-430（旧DRAFT-43）へplayer popup・preview・結果面の重なりを統合。DRAFT-41/44/47/50/51/61/63/64/69/70は既存の設計判断または広い機能範囲を維持し、新規重複を作成しない。未決事項はDRAFT-74へ集約。対象外: 768px以下、dark theme、近日実装の左nav、一般的ariaのみの指摘。fixture固有: Filesツリー/fileType、headless WAV duration、DLsite fixture永続化は採用しない。
<!-- SECTION:NOTES:END -->
