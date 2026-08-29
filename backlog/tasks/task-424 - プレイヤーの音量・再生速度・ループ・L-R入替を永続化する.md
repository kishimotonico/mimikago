---
id: TASK-424
title: プレイヤーの音量・再生速度・ループ・L/R入替を永続化する
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:57'
updated_date: '2026-08-29 17:20'
labels: []
dependencies: []
priority: medium
ordinal: 423000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
client/src/features/player/model/playerController.ts:36-47 の初期値（volume:75, loop:false, playbackRate:1, channelSwap:false）はハードコードで、アプリを開き直すたびにリセットされる。永続化されているのは playerPresentationAtoms.ts のUI表示系（playerUiModeAtom / playerPopupOffsetAtom / nowPlayingViewModeAtom）のみ。ASMR用途では再生環境に合わせて音量やL/R入替を調整する使い方が多く、毎回の設定し直しが日常の不満になる。UI系atomと同じlocalStorage永続化の仕組みで再生パラメータも復元する。2026-08-28の全体監査（プロダクトギャップ調査）で発見。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 音量・再生速度・ループ・L/R入替がリロード後も維持される
- [x] #2 保存値が不正・欠損でも既定値で安全に起動する
- [x] #3 変更範囲のユニットテストがある
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. playerPlaybackPrefs モジュールで localStorage の読み書きと不正値の既定値フォールバックを実装 2. PlayerRuntimeProvider で初期化・変更時保存 3. エンジン生成時に volume/rate/channelSwap を復元 4. playerCoreAtom へ起動時に投影 5. ユニットテスト
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
playerPlaybackPrefs で localStorage に mimimilli:playerPlaybackPrefs を保存。不正値はフィールド単位で既定値。PlayerRuntimeProvider が起動時に復元し変更時に保存。エンジン生成時に volume/rate/channelSwap を適用。playerCoreAtom は起動時にコントローラ状態を投影。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
音量・再生速度・ループ・L/R入替を localStorage に永続化し、リロード後も復元する。不正・欠損は既定値で起動する。ユニットテストで roundtrip・不正値・Provider 初期化を確認した。
<!-- SECTION:FINAL_SUMMARY:END -->
