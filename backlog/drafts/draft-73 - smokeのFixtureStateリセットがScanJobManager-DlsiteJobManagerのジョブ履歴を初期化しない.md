---
id: DRAFT-73
title: smokeのFixtureStateリセットがScanJobManager/DlsiteJobManagerのジョブ履歴を初期化しない
status: Draft
assignee: []
created_date: '2026-08-23 03:56'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-383（smoke並列化）の副産物としての気づき。fixtureアダプタのPOST /api/__test__/resetはFixtureState（server/src/adapters/fixture/state.ts）だけを初期状態へ戻す。ScanJobManager（server/src/scanJobManager.ts）とDlsiteJobManager（server/src/dlsiteJobManager.ts）が保持するジョブ履歴（jobs Map・currentJob・lastCompleted・pendingJobs等）はHonoアプリインスタンス単位の内部状態で、resetの対象外。

現状（TASK-383時点の23件のsmoke）では実害は出ていない。各テストが自分でスキャン等のジョブを都度起動して完了まで待つため、前のテストのジョブ履歴が残っていても直接は干渉しない。

顕在化しうる条件: 「直前のスキャンジョブの履歴が空であること」や「ジョブ一覧の件数が1件だけであること」など、ジョブ管理そのものの状態を厳密にアサートするテストを書いたとき。あるいは複数worker間で同じジョブ履歴を共有しない設計（現状はworkerごとに別プロセスなので問題ないが、将来サーバー構成を変えた場合）。

対応方針の選択肢（未決定）:
- resetFixtureStateと同様に、ScanJobManager/DlsiteJobManagerにもテスト用reset APIを生やす
- あるいはジョブ履歴を全部FixtureStateへ寄せてリセット対象に含める設計変更
- 実害が出るまで対応しない、を明示的に選ぶ

受け入れ条件が今は書けないため、実害が出るテストを書く段になったらタスク化する。
<!-- SECTION:DESCRIPTION:END -->
