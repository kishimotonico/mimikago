---
id: TASK-428.5
title: エラー作品とファイル欠損作品の表示・復旧導線を統一する
status: To Do
assignee: []
created_date: '2026-09-07 09:08'
labels:
  - ui
  - ux
  - error-state
dependencies: []
modified_files:
  - client/src/features/library/ui/WorkTile.tsx
  - client/src/features/library/ui/preview/WorkStatusWarnings.tsx
parent_task_id: TASK-428
priority: high
ordinal: 432000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
lib-browse-A-01、settings-setup-errors-A/B-03/06/07等。同じ作品状態がgrid/list/detailで異なり、グリッドでは異常が分からず、詳細から復旧できない。状態名と登録解除の意味も統一する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 grid・list・preview・詳細・軸でファイル欠損とメタデータ読み込みエラーを同じラベルで表示する
- [ ] #2 グリッドでも警告アイコンと説明titleから状態が分かる
- [ ] #3 エラー詳細にフォルダーを開く・ライブラリ登録を解除する導線がある
- [ ] #4 登録解除の確認に対象件数・削除範囲・再スキャン時の扱いを明記する
- [ ] #5 pnpm test:smokeに新規失敗がない
<!-- AC:END -->
