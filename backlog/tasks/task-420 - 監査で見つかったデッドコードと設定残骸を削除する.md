---
id: TASK-420
title: 監査で見つかったデッドコードと設定残骸を削除する
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:57'
updated_date: '2026-08-29 17:42'
labels: []
dependencies: []
priority: low
ordinal: 419000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-08-28の全体監査で確認した未使用コード・残骸の後片付け。(1) getWorkByPhysicalPathWithLiveProbe（server/src/adapters/real/workRefresh.ts）と fetchWorkDetailByPhysicalPath（workQueryRepository.ts）: TASK-410のルート削除で取り残された物理パス検索系で呼び出し元ゼロ。(2) meta.ts の workDirOf: realアダプタ初期実装から呼び出し元ゼロ。(3) server/src/adapters/fixture/fsResolve.ts の isAudioFileType: リファクタ後どこからも呼ばれない。(4) client/public/tauri.svg: 初期Tauri構成の残骸。(5) .oxlintrc.json と .oxfmtrc.json の server/tmp-verify205/** ignorePatterns: 該当パスはgit履歴にも現ツリーにも存在しない。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 上記5点が、削除前に未使用であることを再確認したうえで削除される
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
削除前に rg / git ls-files で未使用を再確認。getWorkByPhysicalPathWithLiveProbe と fetchWorkDetailByPhysicalPath、workDirOf、isAudioFileType、client/public/tauri.svg、oxlint/oxfmt の tmp-verify205 ignore を削除する。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
削除前再確認: rg で定義以外の参照なし。tauri.svg は client/public のみ（HTML/設定参照なし）。tmp-verify205 は git ls-files にも履歴にも無し。dirname は meta.ts の他用途で残置。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
未使用の物理パス検索・workDirOf・isAudioFileType・tauri.svg・tmp-verify205 ignore を削除した。
<!-- SECTION:FINAL_SUMMARY:END -->
