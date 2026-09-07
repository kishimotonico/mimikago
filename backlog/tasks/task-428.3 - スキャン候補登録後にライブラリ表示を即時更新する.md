---
id: TASK-428.3
title: スキャン候補登録後にライブラリ表示を即時更新する
status: To Do
assignee: []
created_date: '2026-09-07 09:08'
labels:
  - ui
  - bug
  - scan
dependencies: []
modified_files:
  - client/src/features/scan/ui/scanModal/UnregisteredTab.tsx
  - client/src/features/scan/ui/ScanRuntime.tsx
parent_task_id: TASK-428
priority: high
ordinal: 430000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
scan-dlsite-A-03/B-01。候補登録成功時にworks・facets・件数のqueryが無効化されず、モーダルを閉じても一覧が古い。ライブラリ変更後のinvalidate処理を共通化する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 候補登録成功後に作品一覧・軸件数・総トラック数が再読込なしで更新される
- [ ] #2 スマートフォルダーとDLsite通知の関連queryも成功分に追従する
- [ ] #3 部分失敗時は成功した登録だけが反映される
- [ ] #4 候補除外では不要なworks再取得を行わない
- [ ] #5 pnpm test:smokeに新規失敗がない
<!-- AC:END -->
