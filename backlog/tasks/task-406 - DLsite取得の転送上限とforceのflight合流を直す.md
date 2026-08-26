---
id: TASK-406
title: DLsite取得の転送上限とforceのflight合流を直す
status: Done
assignee: []
created_date: '2026-08-26 10:40'
updated_date: '2026-08-26 14:12'
labels: []
dependencies: []
references:
  - server/src/adapters/real/dlsite.ts
  - server/src/adapters/real/dlsiteFetch.ts
  - server/src/adapters/real/sharedFlight.ts
priority: medium
ordinal: 405000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。2点とも DLsite 実HTTPの取得経路。

(1) readLimitedBody（dlsite.ts:28-62）は Content-Length で transferMax を見るが、実読込ループは expandedMax（8MB）だけ。ヘッダ省略や過小申告で設定上限（2MB）を超えて読み、recordSuccess 後に失敗する。

(2) fetchCachedDlsiteAttempt は force 時にキャッシュを迂回するが、dlsiteFlightPool.run のキーは商品コードのみ（dlsiteFetch.ts:179、sharedFlight.ts:91-110）。force 要求が実行中の非force取得に合流し、fresh が保証されない。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Content-Lengthが無い（または過小な）応答でも、実バイト列がtransferMaxを超えた時点で読み取りを打ち切る
- [x] #2 force取得は実行中の非force flightに合流せず、ネットワーク取得を新たに行う
- [x] #3 非force同士の同一商品コードは従来どおりflightを共有する
- [x] #4 上記を観測するテストがあり、修正を戻すと落ちる
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 読込ループにtransferMaxを入れる 2. forceと非forceでflightキーを分ける 3. 上限超過とforce非合流のテストと負の検証 4. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
readLimitedBodyがtransferMaxで打ち切り。forceは非force flightに合流しない。dlsite.test.tsで負の検証済み。
<!-- SECTION:FINAL_SUMMARY:END -->
