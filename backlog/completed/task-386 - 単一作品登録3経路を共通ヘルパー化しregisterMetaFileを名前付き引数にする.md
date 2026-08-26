---
id: TASK-386
title: 単一作品登録3経路を共通ヘルパー化しregisterMetaFileを名前付き引数にする
status: Done
assignee: []
created_date: '2026-08-21 14:49'
updated_date: '2026-08-26 08:06'
labels: []
dependencies: []
priority: low
ordinal: 386000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。scanner.tsのregisterFolderWork(538-556)・projectMetaFile(571-584)・restoreFolderWork(626-639)が「existingWorks取得→ScanUpsertBatch生成→registerMetaFile(12個の位置引数)→publishWork→getWorkWithLiveProbe」という同一手続きをほぼ一字一句コピーしている。scanRegister.ts:313-326のregisterMetaFileは12位置引数(full: boolean, idsAlreadyRegistered: booleanを含む)で、呼び出し側にはtrue, falseという意味の読めないリテラルが並び、順序取り違えを型が検出できない。共通のプライベートヘルパーへ抽出し、booleanは名前付きオプションオブジェクトに置き換える。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 3メソッドが単一の共通ヘルパーを経由し、registerMetaFile直接呼び出しが1箇所になる
- [x] #2 full/idsAlreadyRegistered等のbooleanが名前付きオプションで渡され、呼び出し側から意味が読める
- [x] #3 scanner系の既存テストが緑
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 3経路の差分洗い出し 2. registerMetaFileを名前付き引数化 3. 共通ヘルパー抽出 4. テスト・check
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
registerMetaFileのbooleanをRegisterMetaFileOptionsに、3経路の重複をinvokeRegisterMetaFile/registerSingleWorkFromPreparedへ抽出。registerMetaFile直接呼び出しはscanner.ts:510の1箇所のみ。
<!-- SECTION:FINAL_SUMMARY:END -->
