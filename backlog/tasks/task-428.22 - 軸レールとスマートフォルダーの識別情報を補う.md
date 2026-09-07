---
id: TASK-428.22
title: 軸レールとスマートフォルダーの識別情報を補う
status: To Do
assignee: []
created_date: '2026-09-07 09:09'
updated_date: '2026-09-07 12:20'
labels:
  - ui
  - library
  - smart-folder
dependencies: []
modified_files:
  - client/src/features/library/ui/AxisColumn.tsx
  - client/src/entities/library/axisDefinitions.ts
parent_task_id: TASK-428
priority: medium
ordinal: 449000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
VIS-09、smart-folders-A-07/A-08/A-18とB重複。軸レールに要件上の件数が配線されず、スマートフォルダー名・作成導線・アイコンも現在地を伝えない。既存集計経路から識別情報を渡す。

スマートフォルダー選択時のパンくずへの対象名表示は TASK-428.15 #3 に寄せ、本タスクでは扱わない（AC重複の整理）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 全ビュー軸・分類軸・スマートフォルダーに正しい件数を表示する
- [ ] #2 通常件数と要対応badgeを別の意味として併存させる
- [ ] #3 192px幅で新規作成ラベルが省略されずプラス記号が重複しない
- [ ] #4 pnpm test:smokeに新規失敗がない
<!-- AC:END -->
