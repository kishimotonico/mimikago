---
id: TASK-427
title: DLsite取得で販売区分（全年齢/R15/R18）を作品タグとして登録する
status: Done
assignee:
  - '@cursor'
created_date: '2026-09-02 17:26'
updated_date: '2026-09-02 17:35'
labels: []
dependencies: []
priority: high
ordinal: 426000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
DLsite作品ページの「年齢指定」をパースし、ジャンルと同じく作品タグとして登録する。表示値は全年齢・R15・R18に正規化し、prefixは `販売区分/` とする。既存のサークル・CV・ジャンル変換経路に乗せる。専用カラムは作らない（ADR-0005）。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 parseDlsiteHtmlが作品ページの年齢指定から全年齢/R15/R18を取り出し、DlsiteWorkInfo.ageRatingに入れる。R-15はR15、18禁はR18に正規化する。取れないときはnullでparse_errorにしない
- [x] #2 適用時に販売区分/<値>タグへ変換し、サークル・CV・ジャンルと同じ経路（dlsiteInfoTags / mergeDlsiteTags）で既存タグへ合流する
- [x] #3 初回seedのprefix定義に販売区分（ラベル: 販売区分、軸表示ON、保護なし）を含める。既存ライブラリはseed済みフラグがあるため自動追加しない
- [x] #4 フィクスチャHTMLと正規化のテストが全年齢・R15・R18・欠落・未知表記をカバーする
- [x] #5 docs/dlsite.md と requirements-v4.md 4.4/4.5 を現在の仕様に合わせる
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. DlsiteWorkInfo に ageRating を追加し、年齢指定の正規化とタグ変換（販売区分/）を shared に置く
2. parseDlsiteHtml で年齢指定行を読む。mergeDlsiteTags は shared の変換を使う
3. DEFAULT_TAG_PREFIXES に販売区分を追加。fixture・テストの DlsiteWorkInfo を更新
4. docs/dlsite.md と requirements-v4 を更新し、変更範囲のテストを回す
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
検証: pnpm check と pnpm test は成功。年齢指定は作品概要テーブルから取り、全年齢/R15/R18へ正規化して販売区分タグにする。既存ライブラリのprefixはseed済みフラグのため自動追加しない。キャッシュ済みHTMLは apply-missing で再パースできる。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
DLsite作品ページの年齢指定をパースし、販売区分/全年齢・R15・R18として作品タグに載せるようにした。変換はジャンルと同じ経路（dlsiteInfoTags / mergeDlsiteTags）に集約し、初回seedに販売区分prefixを追加した。pnpm check と pnpm test で確認。
<!-- SECTION:FINAL_SUMMARY:END -->
