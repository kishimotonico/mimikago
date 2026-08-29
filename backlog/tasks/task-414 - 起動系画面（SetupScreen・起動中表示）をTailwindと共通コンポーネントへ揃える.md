---
id: TASK-414
title: 起動系画面（SetupScreen・起動中表示）をTailwindと共通コンポーネントへ揃える
status: In Progress
assignee:
  - '@omp'
created_date: '2026-08-28 14:56'
updated_date: '2026-08-29 17:51'
labels: []
dependencies: []
priority: medium
ordinal: 413000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
client/src/features/setup/ui/SetupScreen.tsx:46-219 はほぼ全JSXがインラインstyleで、ボタンも shared/ui/Button を使わず生のbutton要素を個別スタイリングしている。client/src/app/App.tsx:175-194 の起動中ローディング表示も同様。同じ起動時フルスクリーン画面である app/ui/StartupErrorScreen.tsx はTailwindユーティリティ + 共通Buttonで実装されており、この一群だけが確立パターンから外れている。docs/design-system.md 準拠で書き直す。2026-08-28の全体監査で発見・検証済み（confirmed）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 SetupScreenとApp.tsxの起動中表示がTailwindユーティリティと共通コンポーネントで実装され、インラインstyleが除去される
- [ ] #2 見た目が現行と同等であることを確認する（pnpm test:smoke 通過を含む）
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
SetupScreen のインラインstyleを Tailwind に置き換え、送信/中止は shared/ui/Button を className で現行サイズに合わせる。App.tsx の起動中表示は StartupErrorScreen と同じフルスクリーン Tailwind にする。見た目は現行と同等（半径8px・高さ40/36）。既存 setupScreen テストは文言・ロールを変えない。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
SetupScreen は Tailwind + shared/ui/Button。送信は h-10 / rounded-[8px]、中止は h-9 / border-line。未定義だった --danger は既存アラート色 r-coral に揃えた（設定・スキャンと同じ）。App.tsx の読み込み中は StartupErrorScreen と同じフルスクリーン Tailwind。setupScreen.test.tsx 5件通過。smoke はバッチ完了時。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
起動系画面のインラインstyleをやめ、Tailwind と共通 Button に揃えた。未定義の --danger は既存アラート色 r-coral に置換。
<!-- SECTION:FINAL_SUMMARY:END -->
