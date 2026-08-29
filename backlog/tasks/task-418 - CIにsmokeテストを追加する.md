---
id: TASK-418
title: CIにsmokeテストを追加する
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:56'
updated_date: '2026-08-29 18:03'
labels: []
dependencies: []
priority: medium
ordinal: 417000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
.github/workflows/ci.yml は pnpm check と pnpm test のみで test:smoke を含まない。導入元TASK-401の除外根拠はTASK-345（Windows上のrealアダプタ並列テストのEBUSY）だが、smokeはfixtureアダプタ + Ubuntuで動くため、その根拠はsmokeの実行環境と無関係だった。CIでsmoke（Playwright、new-workシナリオの自前webServer）を実行する。2026-08-28の全体監査で発見。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CIでpnpm test:smokeが実行されgreenになる
- [x] #2 PlaywrightブラウザのインストールとキャッシュがCIへ整備される
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
ci.yml に smoke ジョブを追加する。Playwright は chromium のみ入れ、~/.cache/ms-playwright をバージョンキーでキャッシュする。AC1（CI green）はプッシュ後確認のため未チェックのまま残す。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
ci.yml に ubuntu の smoke ジョブを追加。Playwright は chromium のみ install --with-deps。キャッシュキーは client/package.json の hash。cache-hit 時は install-deps のみ。AC1（CI green）はプッシュ後の確認なので未チェック。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
CI に fixture+Ubuntu の smoke ジョブと Playwright Chromium のキャッシュを追加した。CI 上の green はマージ後の確認になる。
<!-- SECTION:FINAL_SUMMARY:END -->
