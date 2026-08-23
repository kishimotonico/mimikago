---
id: TASK-390
title: server起動設定の読み取りを小さなconfig関数へ集約する
status: To Do
assignee: []
created_date: '2026-08-21 14:50'
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
- [ ] #1 index.tsが直接読む環境変数が単一のconfig関数経由になり、adapterKind等が型付きunionで返る
- [ ] #2 不正値のエラーメッセージと起動時fail-fastの挙動が従来どおり
- [ ] #3 pnpm check・pnpm test:serverが緑
<!-- AC:END -->
