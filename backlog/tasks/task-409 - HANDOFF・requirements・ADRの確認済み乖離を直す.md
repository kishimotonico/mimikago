---
id: TASK-409
title: HANDOFF・requirements・ADRの確認済み乖離を直す
status: Done
assignee: []
created_date: '2026-08-26 10:41'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - docs/HANDOFF.md
  - docs/requirements-v4.md
  - docs/ARCHITECTURE.md
  - docs/adr/0001-typescript-api-server.md
documentation:
  - docs/HANDOFF.md
  - docs/requirements-v4.md
  - docs/ARCHITECTURE.md
  - docs/design-system.md
  - docs/dlsite.md
priority: low
ordinal: 408000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。TASK-391 は README / client preview / ADR-0008 の3点だけで、以下は残っている。

- HANDOFF API表が現行routeを欠落（scan candidates/exclusions/register、works register-preview/DELETE、dlsite fetch-by-code/apply-missing/bulk GET+DELETE、media/workspace 等）
- HANDOFF:126 がナビatom所有元を features/library/model/atoms.ts（drillValue含む）・features/files/model/atoms.ts と誤記。実体は entities/library/model/navigationAtoms.ts と entities/file-system/model/navigationAtoms.ts。features/library/model/atoms.ts に同名の死んだナビatom定義が残っている
- HANDOFF:65-69 が smoke を workers:1 直列と書くが、現行は fullyParallel=true / SMOKE_WORKERS=4
- HANDOFF と design-system.md が shell.css 旧名。現行は client/src/styles/shell/index.css
- ARCHITECTURE.md:60 が DataAdapter を server/src/adapter.ts と書く。実体は adapter/index.ts
- requirements-v4 が実装に逆行（重複UUID自動再採番 vs ADR-0017 の identity_conflict、非対応音声のトラック単位グレーアウト未実装、ポップアップドラッグ不可 vs TASK-359、ヘッダー軽量再スキャン vs ScanModalを開くだけ）
- ADR-0001:35 の better-sqlite3 / Bun compile未達は死文（現行 bun:sqlite）
- dlsite.md のHTTP一覧に GET/DELETE /dlsite/bulk が無い

GET /works/:id/files と GET /media/file の削除は別タスク。仕組み化（リンク検査のcheck組み込み）は今回の対象外。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 HANDOFFのAPI表・atom所有元・smoke並列前提・CSSパスが現行コードと一致する
- [x] #2 features/library/model/atoms.tsの使われていないナビatom定義が削除され、表示設定atomだけが残る
- [x] #3 ARCHITECTURE.mdのDataAdapterパスとADR-0001のSQLite現状が現行実装と一致する
- [x] #4 requirements-v4の重複ID・非対応音声・ポップアップドラッグ・ヘッダー再スキャンが現行実装または未実装として正しく書かれている
- [x] #5 dlsite.mdのHTTP一覧にGET/DELETE /dlsite/bulkがある
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 列挙したdocsを現行コードへ合わせる 2. 死んだナビatom定義を削除 3. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
HANDOFF/requirements/ADR/ARCHITECTURE/dlsite.mdを現行に合わせ、死んだナビatomを削除。
<!-- SECTION:FINAL_SUMMARY:END -->
