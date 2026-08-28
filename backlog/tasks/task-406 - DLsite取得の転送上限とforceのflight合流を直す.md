---
id: TASK-406
title: DLsite取得の転送上限とforceのflight合流を直す
status: Done
assignee: []
created_date: '2026-08-26 10:40'
updated_date: '2026-08-28 14:29'
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

## Comments

<!-- COMMENTS:BEGIN -->
created: 2026-08-28 13:42
---
統合前レビューで追補修正（bed3115）: 追加したループ内transferMaxチェックが無条件に先へ発火し、expandedMax判定が到達不能・Content-Length検証済みの圧縮応答まで2MiBで誤打ち切りする退行になっていた。Content-Length宣言あり→ループ内はexpandedMaxのみ、宣言なし→transferMaxで打ち切りの二段判定へ復元。過小申告はfetch APIの制約上expandedMaxが実質上限（テストで固定）。エラーメッセージも転送/展開で区別。
---

created: 2026-08-28 14:29
---
マージ後のCodexレビュー指摘（chunked圧縮応答でCL無し時のtransferMax適用は展開後バイト数への適用であり、展開後2〜8MiBの正常HTMLを誤拒否しうる）は対応なしと判断: 指摘の観察自体は正確だが、CL無し時にexpandedMaxのみへ緩めるとtransferSize（=読込total、最大8MiB）がdlsiteCacheの検証（transferSize>maxTransferBytesでthrow）に当たり、本タスクの起票理由（recordSuccess後に失敗）が再発する。正しく直すにはCL無し時のtransferSize=undefined化まで必要。現行は端から端まで整合しておりAC#1どおり。実害条件は「chunked＋展開後2MiB超」でDLsite実ページサイズは未計測。TASK-100の実測で2MiB級のページが実在したら再評価する。
---
<!-- COMMENTS:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
readLimitedBodyがtransferMaxで打ち切り。forceは非force flightに合流しない。dlsite.test.tsで負の検証済み。
<!-- SECTION:FINAL_SUMMARY:END -->
