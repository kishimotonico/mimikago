---
id: TASK-425
title: 作品の関連URL（urls）を追加・編集できるようにする
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:57'
updated_date: '2026-08-29 18:49'
labels: []
dependencies: []
priority: medium
ordinal: 424000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
docs/requirements-v4.md 3.2 は urls を「販売ページ（DLsite, FANZA）、作者のSNS、公式サイトなどを複数登録できる」ユーザー管理配列と定義しているが、shared/src/api.ts の workPatchSchema は title/tags/bookmarked のみで urls を受け付けない。client/src/features/library/ui/preview/WorkInfoDialog.tsx は読み取り専用表示のみで、書き込み経路はDLsite apply時に限られる。編集UIとPATCH経路を追加する。危険スキーム対策はTASK-405で入れたsanitizeと整合させる。2026-08-28の全体監査（プロダクトギャップ調査）で発見。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 workPatchSchemaがurls（label + url の配列）を受け付け、fixture/real両方でmimimilli.jsonへ書き戻る
- [x] #2 作品編集UIからurlsの追加・編集・削除ができる
- [x] #3 危険スキーム（javascript:等）が保存・表示の両方で弾かれる
- [x] #4 変更範囲のテストがある
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
workPatchSchema に urls（label+url）を追加し、既存の urlEntrySchema（http/https 絶対URLのみ）で保存時に弾く。fixture/real の PATCH が mimimilli.json へ書き戻す。WorkEditDialog に関連URLの追加・編集・削除を追加。表示は TASK-405 の toSafeExternalUrlHref を継続利用。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
作品編集から関連URLを追加・編集・削除できるようにした。PATCH は fixture/real とも mimimilli.json へ書き戻り、javascript: 等は保存・表示の両方で弾く。スキーマ・UI・結合・smoke で確認。
<!-- SECTION:FINAL_SUMMARY:END -->
