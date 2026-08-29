---
id: TASK-419
title: mimimilli.json書き戻しのCASからrenameまでのレースを実測し必要なら排他を入れる
status: Done
assignee:
  - '@omp'
created_date: '2026-08-28 14:56'
updated_date: '2026-08-29 18:16'
labels: []
dependencies: []
priority: medium
ordinal: 418000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
server/src/adapters/real/meta.ts の writeBytesAtomic は、replace直前のbytes比較でCASを構成するつもりだが、比較と renameSync（replaceWithRollback内）は別syscallで間に排他が無く、scan workerスレッドとメインスレッドの並行書き込みで後勝ち消失（TOCTOU）が起きうる疑いがある。2026-08-28の全体監査で発見（未検証・仮説段階）。方針: 仮説のまま直さず、書き込み順を計装した並行シナリオでまず実測する。再現するなら書き込みの直列化などの排他を入れ、再現しないなら根拠を記録して対応なしで閉じる。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 並行書き込みシナリオの計装と実測結果が記録される
- [x] #2 レースが再現する場合は排他を実装し、再現ケースがテストで通る
- [ ] #3 再現しない場合はその根拠をタスクへ記録して対応なしで完了する
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
計装: Worker 2本が同じ sourceRevision で title / tags を同時 patch。CAS比較と rename の間に MIMIMILLI_ATOMIC_WRITE_CAS_DELAY_MS で Atomics.wait。
排他前の実測:
- 遅延なし 200回: lostUpdate 116 / oneSuccess 84 / bothSuccess 116 / merged 0
- 遅延 30ms 40回: lostUpdate 40 / bothSuccess 40
再現したので compare+rename を .mimimilli.json.lock（open wx）で直列化。遅延はテスト用に残置。
排他後: 遅延 30ms 10回 + 遅延なし 20回、いずれも oneSuccess 1 + SourceChangedError 1、ファイルは片方の完全な書き込み。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Worker並行でCAS→renameのTOCTOUを実測し、遅延なしでも後勝ち消失を確認した。compareとrenameをパス単位の排他ロックで直列化し、再現ケースがテストで通る。
<!-- SECTION:FINAL_SUMMARY:END -->
