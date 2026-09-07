---
id: TASK-428.16
title: プレイヤーの再生状態・トラックエラー・境界操作を統一する
status: To Do
assignee: []
created_date: '2026-09-07 09:08'
updated_date: '2026-09-07 12:18'
labels:
  - ui
  - player
  - error-state
dependencies: []
modified_files:
  - client/src/features/player
parent_task_id: TASK-428
priority: high
ordinal: 443000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
player-A-02/A-03/A-05/A-06/A-09/A-11。一時停止やエラーでも再生中パルスが出て、トラックエラー通知と前後境界の扱いがサーフェスごとに異なる。playing/paused/loading/errorを一つの表示モデルにする。

決定（DRAFT-74 Q-01, 2026-09-07）: 再生速度はポップアップだけでなく再生中タブ（通常モード・没入モードのミニコントロール）でも確認・変更できるようにする。速度ボタンは現在値のラベル（例 `1.0×`）を常時表示し、前後トラック・再生はアイコンのみとする。ラベルで3操作を区別し、別アイコン方式は採らない。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 paused・loading・error中にplaying用パルスを表示しない
- [ ] #2 トラックエラーに対象・理由・可能な再試行・閉じる操作を表示する
- [ ] #3 前後境界のdisabled状態と理由がバー・popup・再生中一覧で一致する
- [ ] #4 再生中一覧のdurationが作品詳細と同じformatterを使う
- [ ] #5 pnpm test:smokeに新規失敗がない
- [ ] #6 再生速度を再生中タブのミニコントロール（通常・没入）で確認・変更でき、速度ボタンが現在値ラベルを常時表示する
<!-- AC:END -->
