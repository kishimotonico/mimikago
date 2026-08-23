---
id: TASK-382
title: DLsite通知系モーダル群をfeatures/libraryからfeatures/dlsiteへ移設する
status: To Do
assignee: []
created_date: '2026-08-21 14:49'
labels: []
dependencies: []
priority: medium
ordinal: 382000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘の第1弾(Codexレビューで「一つずつ切り出す」方針に軽量化)。features/libraryは8,342行でfeatures全体の48%を占め、独立能力が同居している。うちDLsite通知系5ファイル(DlsiteNotificationModals/DlsiteFetchFailedModal/DlsiteParseFailedModal/RjCodeMissingModal/NotificationListModal)は自然な行き先として既存のfeatures/dlsite(432行)がある。切り出しで必要になる状態共有はentities経由の既存正規経路を使う(features間sibling importは禁止のまま)。スマートフォルダー編集・作品プレビューの切り出しは本タスクの効果を見て別途判断する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 DLsite通知系のモーダル群がfeatures/dlsite配下へ移り、features/libraryから消えている
- [ ] #2 features間のsibling importが発生していない(pnpm checkの境界検査が緑)
- [ ] #3 DLsite通知の開閉・一覧・遷移の挙動が従来どおり(pnpm test:smokeが緑)
<!-- AC:END -->
