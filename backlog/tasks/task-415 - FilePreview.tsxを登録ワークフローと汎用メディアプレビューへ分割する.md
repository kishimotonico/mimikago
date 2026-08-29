---
id: TASK-415
title: FilePreview.tsxを登録ワークフローと汎用メディアプレビューへ分割する
status: In Progress
assignee:
  - '@omp'
created_date: '2026-08-28 14:56'
updated_date: '2026-08-29 17:53'
labels: []
dependencies: []
priority: medium
ordinal: 414000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
client/src/features/files/ui/FilePreview.tsx（516行、client内最大ファイル）は、(1) フォルダーの作品登録・解除・ID重複再取り込みという3つのuseMutation + 3つの確認ダイアログを持つワークフローと、(2) image/pdf/video/text/audio の5種別を出し分ける汎用メディアプレビュー（Hero/WorkspaceMedia/ImageMedia/PdfMedia/VideoMedia/TextMedia/UnavailableMedia/MediaError の8関数）という性質の異なる責務を1ファイルに抱えている。ImageMedia/PdfMedia/VideoMedia は errored ステートをsrc変化でリセットする同一パターンを重複実装している。挙動不変の構造リファクタとして分割する。2026-08-28の全体監査で発見・検証済み（confirmed）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 メディアプレビュー群が登録ワークフローと別モジュールへ分離される
- [x] #2 メディア種別ごとのエラー処理の重複パターンが共通化される
- [ ] #3 挙動不変（既存テストとsmokeが期待値の変更なしで通る）
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
FilePreview.tsx から Hero / WorkspaceMedia / 5種別メディア / Unavailable / MediaError を FilePreviewMedia.tsx へ移す。Image/Pdf/Video の src 変化で errored をリセットする重複を useMediaLoadError に共通化。登録 mutation と確認ダイアログは FilePreview に残す。既存テスト・smoke の期待値は変えない。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
メディア群（Hero / WorkspaceMedia / Image/Pdf/Video/Text / Unavailable / MediaError）を FilePreviewMedia.tsx へ移動。Image/Pdf/Video の src 変化で errored を戻す処理は useMediaLoadError + MediaLoadGuard に一本化。FilePreview は登録・解除・ID重複の mutation とダイアログだけを残す。既存テスト期待値は未変更。smoke はバッチ完了時。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
FilePreview から汎用メディアプレビューを分離し、画像・PDF・動画の読み込みエラー処理を共通化した。登録ワークフローは FilePreview に残した。
<!-- SECTION:FINAL_SUMMARY:END -->
