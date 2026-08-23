---
id: TASK-394
title: 'test:smoke library.smoke.spec.tsのフルスイート実行時のみ2件が落ちるflakeを直す'
status: To Do
assignee:
  - 原因（他specとの状態共有／実行順など）を特定し、直す
created_date: '2026-08-23 02:34'
labels: []
dependencies: []
ordinal: 393000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
フルの pnpm test:smoke（全spec同時実行）だと library.smoke.spec.ts の「スキャン完了後に候補を選択登録でき、問題をFilesで確認できる」と「FilesでID重複を表示し、確認して別作品として取り込める」が毎回落ちる。library.smoke.spec.ts単体実行では常に通る。TASK-387の作業中に発見。TASK-387の変更を全てstashしてmaster相当のコードに戻しても同じ2件が同じ場所で落ちることを確認済みのため、TASK-387由来ではなく既存のflake（他specファイルとの実行順・fixtureサーバー状態共有に起因する可能性）。原因調査は未着手。
<!-- SECTION:DESCRIPTION:END -->
