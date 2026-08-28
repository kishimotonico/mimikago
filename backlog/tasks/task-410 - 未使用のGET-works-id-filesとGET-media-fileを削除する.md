---
id: TASK-410
title: '未使用のGET /works/:id/filesとGET /media/fileを削除する'
status: Done
assignee: []
created_date: '2026-08-26 10:41'
updated_date: '2026-08-26 14:12'
labels: []
dependencies:
  - TASK-409
references:
  - server/src/routes/works.ts
  - server/src/routes/media.ts
  - docs/HANDOFF.md
priority: low
ordinal: 409000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
静的調査(2026-08-26)の指摘。GET /works/:id/files（routes/works.ts:145-148）と GET /media/file/:id/:path（routes/media.ts:75-82）は client から呼ばれていない。getFileUrl も既に無い。FilePreview は workspace media を使う。HANDOFF の API 表には現役として載っている。

死んだエンドポイントを削除し、shared の未使用スキーマと HANDOFF からも落とす。必要機能ならこのタスクではなく別途 client API を足す。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GET /works/:id/files と GET /media/file/:id/:path のroute実装が削除されている
- [x] #2 clientから当該URLを組み立てるコードが残っていない
- [x] #3 HANDOFFのAPI表から両エンドポイントが消えている
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 未使用routeと参照を削除 2. HANDOFFの表を更新 3. pnpm check / pnpm test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
GET /works/:id/files と GET /media/file を削除し、未使用スキーマとHANDOFF行も除去。cover/audio/workspaceは維持。
<!-- SECTION:FINAL_SUMMARY:END -->
