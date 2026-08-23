import { and, eq } from "drizzle-orm";
import type { Db } from "./db.ts";
import { tracks } from "./catalogSchema.ts";
import type { CoverLocationRow, MediaRootRow } from "./workRowMapping.ts";

export function getCoverLocation(db: Db, id: string): CoverLocationRow | null {
  return (
    (db.sqlite
      .query(
        `SELECT id, physical_path AS physicalPath, cover_image AS coverImage
           FROM main.works WHERE id = ?`,
      )
      .get(id) as CoverLocationRow | undefined) ?? null
  );
}

export function getMediaRoot(db: Db, id: string): MediaRootRow | null {
  return (
    (db.sqlite
      .query(
        `SELECT physical_path AS physicalPath
           FROM main.works WHERE id = ?`,
      )
      .get(id) as MediaRootRow | undefined) ?? null
  );
}

export function hasTrackFile(db: Db, workId: string, file: string): boolean {
  return (
    db.catalog
      .select({ id: tracks.id })
      .from(tracks)
      .where(and(eq(tracks.workId, workId), eq(tracks.file, file)))
      .limit(1)
      .get() !== undefined
  );
}
