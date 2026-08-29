---
id: TASK-416
title: server/tests/realのWork全量ビルダーを共有ヘルパーへ集約する
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:56'
updated_date: '2026-08-29 17:41'
labels: []
dependencies: []
priority: low
ordinal: 415000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
フルの Work オブジェクトを組み立てる sampleWork() が server/tests/real 配下の7ファイルにほぼ同一の20〜30行で重複実装されている。server/tests/helpers/workTestUtils.ts には WorkSummary 用の makeWorkSummary()（TASK-392）だけがあり Work 用が無い。Work型へのフィールド追加のたびに7箇所の同時修正が要り、デフォルト値の解釈がファイル間でずれるリスクがある。2026-08-28の全体監査で発見・検証済み（confirmed）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 workTestUtilsに部分上書き可能なWork用ビルダーが追加される
- [x] #2 7ファイルのsampleWork個別実装が共有ヘルパーへ置き換わり、テストが通る
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
workTestUtils に makeWork(overrides) を追加（emptyDlsiteState / resolvedDuration、よくあるデフォルト、Partial 上書き）。7+1ファイルの sampleWork 本体を削除し、ファイル固有の差（title、playlists、physicalPath 等）だけ overrides で渡す。既存テストの期待値は変えない。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
makeWork(overrides) を workTestUtils に追加。共通デフォルトは title「作品 ${id}」、1プレイリスト1トラック、emptyDlsiteState。resume / persistence / fsBrowse / busyTimeout は差分（区間トラック・固定ID・空playlists 等）だけ残す薄いラッパ。期待値は変更していない。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Work 全量ビルダーを makeWork に集約し、server/tests/real の sampleWork 重複を置き換えた。既存テストは期待値を変えずに通過。
<!-- SECTION:FINAL_SUMMARY:END -->
