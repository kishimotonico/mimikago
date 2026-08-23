---
id: TASK-376
title: realのメディア配信でaudio経路を登録トラックのみに制限する
status: To Do
assignee: []
created_date: '2026-08-21 14:47'
labels: []
dependencies: []
priority: high
ordinal: 376000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。realアダプタのlocateMedia(server/src/adapters/real/coverMediaMethods.ts:95-110)がkind引数を_kindとして無視し、audio経路もfile経路と同一の「作品ディレクトリ配下の任意相対パス配信」になっている。fixture(server/src/adapters/fixture/coverMedia.ts:18-34)はkind=audioのときfindTrackByFileで実トラック登録を照合しており、realだけがMediaAdapter契約を満たしていない。将来のLAN公開・認証はkind境界を土台にするため、今のうちに揃える。file経路(作品配下の閲覧)の挙動は変えない。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 realのaudio経路は、catalogのtracks関係に登録されたファイルのみ解決し、未登録の相対パスは404になる
- [ ] #2 登録済みトラックは引き続きRange(206)配信できる
- [ ] #3 file経路の挙動は従来どおり(作品ディレクトリ配下の任意ファイル)
- [ ] #4 real/fixture双方でkindごとの境界差(登録済み音声・未登録音声・パストラバーサル)を検証するテストがある
<!-- AC:END -->
