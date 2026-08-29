---
id: TASK-423
title: 単一ファイル形式作品の手動登録を実装する
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:57'
updated_date: '2026-08-29 18:43'
labels: []
dependencies: []
priority: medium
ordinal: 422000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
docs/requirements-v4.md 2.1/2.2/3.5 は単一ファイル形式（例: fanza/d00001.mp3）をフォルダー形式と並ぶ第一級の作品形式と定義し、「自動生成の対象外。ユーザーがUI上から手動でメタファイルを作成する」と明記しているが、実装は登録経路がフォルダー専用で塞がっている。client/src/features/files/ui/FilePreview.tsx:131 の canRegisterFolder は isDir 前提でファイルには登録ボタンが出ず、server側の register-preview / 作品作成もフォルダー前提（server/src/adapters/real/workMethods.ts:74-84）。ファイル1つを全体1トラックの作品として登録できるようにする。shared → fixture → real の順で揃える。2026-08-28の全体監査（プロダクトギャップ調査）で発見。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 File Explorerで未登録の音声ファイルに作品として登録する導線が出る
- [x] #2 register-previewと登録APIが単一ファイル形式に対応する（fixture/real両方）
- [x] #3 登録によりmimimilli.jsonが単一ファイル形式の仕様どおり生成される
- [x] #4 登録済みの単一ファイル作品がライブラリ・プレイヤーでフォルダー形式と同様に扱える
- [x] #5 登録フローがsmokeまたは結合テストで検証される
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
sharedにsidecarメタ名とisAudioWorkPathを置き、physicalPathは音声ファイル、メディア解決は親ディレクトリ。register-preview/登録APIをfixture→realで対応し、File Explorerに未登録音声の導線を出す。mimimilli.jsonは<stem>.mimimilli.json、トラックはファイル全体1本。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
shared に sidecar 名と isAudioWorkPath / workMediaRoot を置き、physicalPath は音声ファイル本体、メディア解決は親ディレクトリ。register-preview / POST /works を fixture・real でファイル対応。File Explorer の未登録音声に登録導線を出し、mimimilli.json は <stem>.mimimilli.json、トラックはファイル全体1本（start/end なし）。カバーは新規登録時 null。祖先フォルダーが既に作品なら登録拒否。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
単一ファイル形式の手動登録を実装した。File Explorer から未登録音声を登録でき、sidecar メタが仕様どおり生成され、ライブラリとプレイヤーはフォルダー形式と同じ経路で扱う。real 結合テストと fixture 契約、Files smoke でフローを確認。
<!-- SECTION:FINAL_SUMMARY:END -->
