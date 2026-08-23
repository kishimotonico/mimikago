---
id: TASK-391
title: ドキュメントとコードの確認済み乖離を修正する
status: To Do
assignee: []
created_date: '2026-08-21 14:50'
labels: []
dependencies: []
priority: low
ordinal: 391000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)で確認された具体的なドキュメント乖離の修正。(1)README.md:172の「tests/visual/」記載はTASK-221で廃止済みの概念(client/tests配下はhelpers/smoke/unitのみ)。(2)client/package.json:11の「preview: vite preview」はvite.config.ts:55のcommand判定により/apiプロキシが組まれず実質機能しない(本番相当確認はルートのpreview:fixture系に一本化済み)。(3)docs/adr/0008の関連リンクscripts/spike/bun-distribution/README.mdはリンク切れ(Git履歴cad3c6fで削除済み)、同17行目に旧名Mimikago表記が残存。仕組み化(リンク検査のcheck組み込み等)は今回は行わず、再発したら検討する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 README.mdのプロジェクト構成からtests/visual/の記載が消え、実態と一致する
- [ ] #2 client/package.jsonの機能しないpreviewスクリプトが削除されている
- [ ] #3 ADR-0008のリンク切れと旧名表記が修正されている
<!-- AC:END -->
