---
id: TASK-382
title: DLsite通知系モーダル群をfeatures/libraryからfeatures/dlsiteへ移設する
status: In Progress
assignee: []
created_date: '2026-08-21 14:49'
updated_date: '2026-08-23 02:13'
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
- [x] #1 DLsite通知系のモーダル群がfeatures/dlsite配下へ移り、features/libraryから消えている
- [x] #2 features間のsibling importが発生していない(pnpm checkの境界検査が緑)
- [ ] #3 DLsite通知の開閉・一覧・遷移の挙動が従来どおり(pnpm test:smokeが緑)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. features/library/ui の5ファイル(DlsiteNotificationModals/DlsiteFetchFailedModal/DlsiteParseFailedModal/RjCodeMissingModal/NotificationListModal)と、それが依存するfeatures/library/modelの6ファイル(dlsiteNotificationModal/dlsiteFetchFailed/dlsiteMissingRjCode/dlsiteParseFailed/useDlsiteNotificationList/useDlsiteNotificationSummary、他featureから参照されていないことを確認済み)をgit mvでfeatures/dlsiteへ移設\n2. 移設先ファイル内の相対importを更新(features/dlsite配下でも../../../ の深さは変わらないため、library固有参照が無ければパス文字列は不変)\n3. app/App.tsx・app/model/activeModal.ts・app/ui/NotificationBell.tsx のimportパスをfeatures/dlsiteへ更新\n4. pnpm check / pnpm test / pnpm test:smoke を実行
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
features/library/ui の5モーダル（DlsiteNotificationModals/DlsiteFetchFailedModal/DlsiteParseFailedModal/RjCodeMissingModal/NotificationListModal）と、それらだけが依存していたfeatures/library/modelの6ファイル（dlsiteNotificationModal/dlsiteFetchFailed/dlsiteMissingRjCode/dlsiteParseFailed/useDlsiteNotificationList/useDlsiteNotificationSummary）をgit mvでfeatures/dlsiteへ移設。移設先の相対パス構造がlibraryと同一のため内部import文の変更は不要。app/App.tsx・app/model/activeModal.ts・app/ui/NotificationBell.tsxのimportパスをfeatures/dlsiteに更新。

検証: pnpm check（境界検査含め全緑）、pnpm test（server 713 pass/client 845 pass、いずれも単体実行で緑）。

pnpm test:smokeは1回目21 passed/2 failed、単体再実行では両方緑、3回目のフル実行は14 passed/9 failedで、うち1件はopenApp自体（support.ts:30の.mle-col.is-axisが20秒のbootTimeoutで見つからない）が落ちるという形。失敗したテストにDLsite通知モーダル関連は一件も含まれず、nowPlaying・ヨコスクロール・Filesビューワーなど無関係な領域に広く分散しており、並列負荷によるものと統括が判断し切り分け中。緑だったとは言えない状態のためAC#3は未チェックのまま統括の判断待ち。
<!-- SECTION:FINAL_SUMMARY:END -->
