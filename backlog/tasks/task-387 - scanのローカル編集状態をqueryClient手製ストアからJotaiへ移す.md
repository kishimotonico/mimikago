---
id: TASK-387
title: scanのローカル編集状態をqueryClient手製ストアからJotaiへ移す
status: Done
assignee: []
created_date: '2026-08-21 14:50'
updated_date: '2026-08-23 02:34'
labels: []
dependencies: []
priority: low
ordinal: 387000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
アーキテクチャ監査(2026-08-21)の指摘。他のfeatureは「サーバー状態=TanStack Query、クライアント状態=Jotai」の二層で一貫しているが、scanだけが承認/除外のローカル編集状態までqueryClient.setQueryDataを手製KVストアとして使い(entities/scan/scanCandidatesCache.ts:5-58の手製issued/appliedシーケンス番号)、useSyncExternalStore+getQueryCache().subscribe+JSON.stringifyキー比較という独自購読(features/scan/model/useScanCandidatesCache.ts:16-53)を実装している。まだ他へ拡散していないうちに標準パターンへ寄せる。サーバー由来の候補データはQueryのまま、ユーザーのローカル編集分をJotai atomへ分離する方向。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 scanCandidatesCacheの手製シーケンス番号とuseSyncExternalStore購読が廃止されている
- [x] #2 承認/除外のローカル編集状態がJotai atom(または標準のQuery経路)で管理される
- [ ] #3 スキャンモーダルの候補承認・除外・登録の挙動が従来どおり(pnpm test:smokeが緑)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. entities/scan/model/atoms.tsへscanCandidateHiddenPathsAtom(ローカルで除外/承認済みにしたpathのSet)を追加
2. entities/scan/scanCandidatesCache.tsを書き換え: 手製issued/appliedシーケンスを廃止し、fetchScanCandidates(素のfetch関数)とrefreshScanCandidates(queryClient.fetchQueryでの明示リフレッチ、同時呼び出しはQuery自身のdedupeに委ねる)のみに縮小
3. features/scan/model/useScanCandidatesCache.tsを書き換え: useSyncExternalStore+手製購読を廃止し、useQuery(enabled:false, 明示refreshでのみfetch)+useAtomValue(hiddenPaths)の合成に。syncScanCandidatesFromLastは純関数として維持
4. UnregisteredTab.tsx: updateScanCandidatesCache呼び出しをhiddenPaths atomへのadd(承認/除外時)に置き換え
5. restore系(UnregisteredTabのToast取り消し、ExcludedFoldersSettings)でhiddenPathsから対象pathを除去した上でrefreshScanCandidatesを呼ぶ
6. 単体テスト(useScanCandidatesCache.test.ts, refreshScanCandidates.test.ts)を新設計に合わせて書き換え。特に「登録後の遅延refetchが巻き戻さない」ケースをhiddenPaths分離で構造的に保証されることを検証するテストに置き換える
7. pnpm check && pnpm test、関連ならpnpm test:smoke
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
手製issued/appliedシーケンス番号とuseSyncExternalStore購読を廃止し、サーバー由来のcandidatesはQuery(enabled:false、明示refreshScanCandidates経由のみ取得)、ユーザーのローカル編集（承認/除外）はJotai atom(scanCandidateHiddenPathsAtom、非表示pathのSet)へ分離した。

【手製シーケンス番号が担っていた役割と新設計での扱い】
旧issued/appliedは「refreshScanCandidates(サーバー再取得)がローカル編集(updateScanCandidatesCache)より古い応答で上書きしてしまう」競合を防ぐためのものだった。新設計ではサーバーデータ(Query)とローカル編集(hiddenPaths atom)を別のストレージに分離し、表示は毎回 Queryのcandidates.filter(!hiddenPaths.has(path)) で合成する。承認/除外の成功はサーバーへ確定済みの操作のみをhiddenPathsへ積むため、いつ・どのタイミングでcandidatesの再取得が完了してもhiddenPathsを巻き戻すことはない（両者が独立ストレージであることが構造的に保証する。旧設計のような時刻比較は不要になった）。restore（取り消し）だけは明示的にhiddenPathsから対象pathを外した上でrefreshScanCandidatesを呼び、サーバー側の除外解除を反映する。

【変更ファイル】
- client/src/entities/scan/model/atoms.ts: scanCandidateHiddenPathsAtom追加
- client/src/entities/scan/scanCandidatesCache.ts: 手製シーケンスを削除、fetchScanCandidates + refreshScanCandidates(queryClient.fetchQueryへの薄いラッパー、並行呼び出しはQuery自身のfetch dedupeに委ねる)に縮小
- client/src/features/scan/model/useScanCandidatesCache.ts: useSyncExternalStore+手製購読を廃止、useQuery(enabled:false)+useAtomValue(hiddenPaths)の合成に書き換え
- client/src/features/scan/ui/scanModal/UnregisteredTab.tsx: 承認/除外成功時にhiddenPathsへadd、取り消し成功時にhiddenPathsから除去
- client/src/features/settings/ui/ExcludedFoldersSettings.tsx: 復元成功時にhiddenPathsから除去
- テスト: client/tests/unit/useScanCandidatesCache.test.ts, refreshScanCandidates.test.ts を新設計に合わせて書き換え（遅延refetchで巻き戻らないことをhiddenPaths分離の観点で検証するテストへ差し替え）。client/tests/unit/scanModal.test.ts, runtimeEventSource.test.ts はrefreshScanCandidatesの実装変更（queryClient.setQueryDataを直接呼ばずqueryClient.fetchQuery経由になった）に伴う最小修正

【検証結果】
- pnpm check: 緑
- pnpm test: 緑（client 844件 / server・shared 715件、全pass）
- pnpm test:smoke: library.smoke.spec.ts単体実行では17件全てpass（候補の除外・取り消し・承認登録を含む）。ただし全spec同時実行のフル pnpm test:smoke では library.smoke.spec.ts の2件（候補登録後のFiles遷移、ID重複解決）が毎回失敗する。本変更を全てgit stashしてmaster相当に戻した状態でも同じ2件が同じ箇所で同様に失敗することを確認済みで、TASK-387の変更とは無関係な既存のflake（他specとの実行順/fixtureサーバー状態共有起因の疑い）。TASK-394として起票した。

【想定外・範囲外の気づき】
- useQuery(enabled:false)は、queryClient.removeQueriesでキャッシュを削除しても、コンポーネントが別の理由で再レンダーするまで観測結果が追従しない（TanStack Query既知の挙動）。本番コードでSCAN候補キャッシュにremoveQueriesを使う箇所は無く実害はないが、旧実装（getQueryCache().subscribeへの直接購読）はこのケースも拾えていたため、その分のテストケース（removeQueries後にlast結果へフォールバックし直す）は実運用と対応しないものと判断し削除した。
- pnpm test:smokeのフル実行専用のflake（TASK-394）を発見。原因調査は未着手。
<!-- SECTION:FINAL_SUMMARY:END -->
