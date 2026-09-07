---
id: TASK-428.9
title: 設定モーダルと結果バナーの操作を常に到達可能にする
status: To Do
assignee: []
created_date: '2026-09-07 09:08'
updated_date: '2026-09-07 12:19'
labels:
  - ui
  - layout
  - settings
dependencies: []
modified_files:
  - client/src/features/settings/ui/SettingsModal.tsx
  - client/src/features/library/ui/ErrorViewBulkDeleteBanner.tsx
parent_task_id: TASK-428
priority: high
ordinal: 436000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
settings-setup-errors-A/B-04/05。設定本文の固定上限と内側スクロールで下部項目へ到達しにくく、エラー作品の一括操作もプレビューに隠れる。header/body/footerのスクロール責務とバナーの所属幅を整理する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 設定モーダルのbodyだけがスクロールし、header/footerは維持される
- [ ] #2 prefix・除外フォルダー・エクスポートへマウスとTabの両方で到達できる
- [ ] #3 プレビュー表示中もエラー作品の一括操作が隠れずクリックできる
- [ ] #4 pnpm test:smokeに新規失敗がない
- [ ] #5 設定モーダルのbody以外に入れ子のスクロール領域を置かない（prefix一覧・除外フォルダー一覧はmax-heightと内側スクロールを持たず本文と一緒に伸びる）
<!-- AC:END -->
