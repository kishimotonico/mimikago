---
id: TASK-390
title: server起動設定の読み取りを小さなconfig関数へ集約する
status: Done
assignee: []
created_date: '2026-08-21 14:50'
updated_date: '2026-08-23 02:06'
labels: []
dependencies: []
priority: low
ordinal: 390000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘の軽量版(Codexレビューで「全変数のZod化・型付きconfig注入は広げすぎ」に調整)。server/src/index.ts:36-67がprocess.env.MIMIMILLI_ADAPTER等を型なしstringのままternaryとswitchで独立に文字列比較しており、adapterKindのようなunionになるべき値が型で締結されていない。index.tsが直接読む起動設定(ADAPTER/MOCK_SCENARIO/STATIC_DIR/PORT等)だけを1つの小さなconfig関数(型付きの戻り値)へ集め、起動時に一度だけ解釈する。DLsite固有(dlsiteConfig.ts)やdataRoot固有の検証は現モジュールに残す。clientやscriptsの変数は対象外。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 index.tsが直接読む環境変数が単一のconfig関数経由になり、adapterKind等が型付きunionで返る
- [x] #2 不正値のエラーメッセージと起動時fail-fastの挙動が従来どおり
- [x] #3 pnpm check・pnpm test:serverが緑
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 現状の不正値失敗一覧を洗い出す 2. serverConfig.ts を追加 3. index.ts を更新 4. テスト追加・負の検証 5. pnpm check && pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
resolveServerConfig が adapterKind/staticDir を値として返す形に整理。MIMIMILLI_ADAPTER は parseAdapterKind で即検証し不正値は initLogger 前に fail-fast（stderr へ直接出力）。ensureAdapterKind/isRealAdapter/resolveStaticDir メソッドは廃止。shutdown.test.ts を新しい起動失敗挙動に合わせて更新。
<!-- SECTION:FINAL_SUMMARY:END -->
