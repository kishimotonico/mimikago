---
id: TASK-413
title: queryWorksの一覧行にZod検証と不正行スキップを適用する
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:56'
updated_date: '2026-08-29 17:38'
labels: []
dependencies: []
priority: medium
ordinal: 412000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
server/src/adapters/real/workQueryRepository.ts の queryWorks（ライブラリ一覧のメイン経路）は生SQL行を RawWorkListRow[] へキャストしたまま WorkListItem を組み立てて返す。status 列は catalogSchema.ts で notNull のみでCHECK制約が無く、同ファイルの listSummaries/rowToSummary が持つ parseRecord + PersistentDataError による不正行スキップの安全網が一覧経路だけ欠けている。routes 側にもレスポンス検証は無い。また同ファイルの queryDlsiteNotifications は status のリテラルUnionを手書きしており、shared/src/dlsite.ts の dlsiteStatusSchema と二重定義でドリフトに気づけない。2026-08-28の全体監査で発見・検証済み（confirmed）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 queryWorksの行がZod検証され、不正行はlistSummariesと同じ方針でスキップ・報告される
- [x] #2 queryDlsiteNotificationsのstatus型がsharedのdlsiteStatusSchema由来へ一本化される
- [x] #3 不正なstatus値を持つ行を含むケースの回帰テストがある
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. queryWorks の各行を workListItemSchema + parseRecord で検証し、PersistentDataError は listSummaries と同様に skipped へ隔離する。SQL の total/stats はそのまま、items から除外し dataIntegrityWarning を付ける。ログは空ルール smart-folder が queryWorks を直接呼ぶため queryWorks 内（http）で出す。2. queryDlsiteNotifications の status 手書き Union をやめ、行を dlsiteNotificationItemSchema（status は dlsiteStatusSchema）で parseRecord する。3. 不正 status の回帰を workRepoPersistence と GET /api/works HTTP に追加する。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
queryWorks は rowToWorkListItem → workListItemSchema の parseRecord。PersistentDataError は skipped に隔離し、SQL の total/stats はそのまま、items から除外して dataIntegrityWarning を付ける。空ルール smart-folder が queryWorks を直接呼ぶためログは queryWorks 内（http / query-works）。queryDlsiteNotifications は dlsiteNotificationItemSchema（status は dlsiteStatusSchema）で parseRecord。回帰: workRepoPersistence の queryWorks と GET /api/works HTTP。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
queryWorks の一覧行を Zod 検証し不正行を listSummaries と同じスキップ・警告にした。queryDlsiteNotifications の status を dlsiteStatusSchema 由来に一本化。不正 status の回帰テストを追加。
<!-- SECTION:FINAL_SUMMARY:END -->
