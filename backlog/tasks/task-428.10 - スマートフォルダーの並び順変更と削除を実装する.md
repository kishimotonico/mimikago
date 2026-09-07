---
id: TASK-428.10
title: スマートフォルダーの並び順変更と削除を実装する
status: To Do
assignee: []
created_date: '2026-09-07 09:08'
labels:
  - ui
  - smart-folder
dependencies: []
modified_files:
  - client/src/features/library/ui/SmartFolderEditorModal.tsx
  - client/src/features/library/model/smartFolderEditor.ts
parent_task_id: TASK-428
priority: high
ordinal: 437000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
smart-folders-A-01/A-02およびB重複。作成済みスマートフォルダーを削除できず、表示が設定準拠と示す並び順も編集できない。既存APIとSORT_OPTIONSをUIへ接続する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 作成・編集時に並び順を選択でき、再表示後も保持される
- [ ] #2 編集時だけ削除操作を表示し、確認文で作品は削除されないと明記する
- [ ] #3 削除成功後に軸行を消し、すべての作品へ移動する
- [ ] #4 取消時はフォルダーと編集内容を変更しない
- [ ] #5 pnpm test:smokeに新規失敗がない
<!-- AC:END -->
