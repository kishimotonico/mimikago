---
id: TASK-426
title: 連続再生中の壊れたトラックを自動スキップする
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:57'
updated_date: '2026-08-29 18:53'
labels: []
dependencies: []
priority: medium
ordinal: 425000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
client/src/features/player/model/playerController.ts の audioFailed ハンドラ（319-327行）は状態を無条件に error にして停止するだけで、audioEnded のような次トラックへの前進処理を持たない。このため長尺作品（20トラック超など）の途中1ファイルが壊れているだけで、以降のすべてのトラックが再生されずに止まり、離席リスニング中は無音のまま気づけない。壊れたトラックはスキップして次へ進み、スキップしたことを通知する。全滅時の無限スキップは防ぐ。2026-08-28の全体監査（プロダクトギャップ調査）で発見。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 途中トラックのデコード失敗時、次トラックへ自動で進んで再生が継続する
- [x] #2 スキップが発生したことがユーザーへ通知される
- [x] #3 連続して失敗が続く場合（例: 2件連続）は停止してエラー表示になり、無限スキップしない
- [x] #4 最終トラックの失敗時はエラー停止する
- [x] #5 playerControllerのユニットテストで上記の分岐が検証される
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
audioFailed で次トラックへ前進。連続2件または最終トラックは error 停止。スキップは GlobalToast で通知。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
audioFailed は最終トラックまたは連続2件失敗で error 停止、それ以外は次トラックへ loadTrack。成功再生（audioPlaying）とユーザーのトラック切替で連続失敗カウンタをリセット。スキップは notifyTrackSkipped → GlobalToast。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
連続再生中の壊れたトラックを自動スキップするようにした。途中のデコード失敗は次へ進みトーストで通知し、連続2件または最終トラックの失敗では従来どおり error 停止する。playerController の分岐をユニットテストで固定した。
<!-- SECTION:FINAL_SUMMARY:END -->
