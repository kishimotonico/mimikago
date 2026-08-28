---
id: TASK-399
title: 壊れたメタのcandidateIdで既存作品の物理パスが乗っ取られるのを直す
status: Done
assignee: []
created_date: '2026-08-26 10:39'
updated_date: '2026-08-28 13:42'
labels: []
dependencies:
  - TASK-386
references:
  - server/src/adapters/real/scanRegister.ts
  - server/src/adapters/real/catalogWorkRepository.ts
priority: high
ordinal: 398000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。handleMetaParseError（server/src/adapters/real/scanRegister.ts:287-325）は MetaParseError.candidateId を physicalPath 一致より優先して既存作品を選び、batch.addError(existing.id, workDir, metaPath) する。catalogWorkRepository.markWorkError（:231-239）はその id の physicalPath/metaPath を壊れたファイル側へ上書きする。

既存作品フォルダをコピーしてバックアップし、コピー側の mimimilli.json が壊れている（id はコピー元のまま）だけで、スキャン時に元作品の catalog 投影が乗っ取られる。seenIds にも載るため missing 判定も避ける。

IDは信頼せず physical path 一致を優先する。IDだけ一致して path が違う場合は identity_conflict と同じ扱いにする。scanRegister.ts は TASK-386 が改修中なので、その完了後に着手する。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 既存作品と異なるディレクトリにある、同じidを持つ壊れたmimimilli.jsonをスキャンしても、既存作品のphysicalPath/metaPathが上書きされない
- [x] #2 その壊れたファイルは既存作品のerror状態にも紐付かない（identity_conflictまたは独立したerrorとして扱われる）
- [x] #3 同じディレクトリの壊れたメタは従来どおりその作品をerrorにする
- [x] #4 上記を観測するテストがあり、修正を戻すと落ちる
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. handleMetaParseErrorの紐付け順をphysical path優先に変える 2. ID一致・path不一致をidentity_conflictへ 3. 乗っ取りを再現するrealテストを追加し負の検証 4. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Comments

<!-- COMMENTS:BEGIN -->
created: 2026-08-28 13:42
---
統合前レビューで追補修正（e6430c0）: 乗っ取り防止分岐が、root変更後に残る旧root作品（physicalPathがroot外）とのID一致時にtoPortableRelativePathの例外でスキャン全体を失敗させていた。identity_conflictのpathsはroot相対のworkspacePathSchemaでroot外パスを表現できないため、この場合はconflict扱いにせず独立したerror（invalidMetaFiles）へ落とす。回帰テストをidentityConflict.test.tsに追加済み。
---
<!-- COMMENTS:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
handleMetaParseErrorをphysical path優先にし、別ディレクトリの壊れたメタはidentity_conflictとして既存投影を維持。identityConflict.test.tsで負の検証済み。
<!-- SECTION:FINAL_SUMMARY:END -->
