export interface UrlEntry {
  label: string;
  url: string;
}

export interface Track {
  title: string;
  file: string;
  start?: number;
  end?: number;
}

export interface Playlist {
  name: string;
  tracks: Track[];
}

export interface Work {
  id: string;
  title: string;
  coverImage: string | null;
  defaultPlaylist: string | null;
  createdAt: string | null;
  status: string;
  physicalPath: string;
  totalDurationSec: number;
  addedAt: string;
  errorMessage: string | null;
  urls: UrlEntry[];
  tags: string[];
  playlists: Playlist[];
}

export interface WorkSummary {
  id: string;
  title: string;
  coverImage: string | null;
  status: string;
  physicalPath: string;
  totalDurationSec: number;
  addedAt: string;
  errorMessage: string | null;
  urls: UrlEntry[];
  tags: string[];
  trackCount: number;
}

export interface ScanResult {
  registered: number;
  newlyGenerated: number;
  errors: number;
  missing: number;
  newWorkIds: string[];
}

export type SortId =
  | "added-desc"
  | "added-asc"
  | "title-asc"
  | "title-desc"
  | "duration-desc"
  | "duration-asc";

export type ViewMode = "grid" | "table";

export type GridSize = "S" | "M" | "L" | "XL";

export const GRID_SIZES: Record<GridSize, number> = {
  S: 120,
  M: 160,
  L: 200,
  XL: 260,
};

export const GRID_SIZE_KEYS: GridSize[] = ["S", "M", "L", "XL"];

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "added-desc", label: "追加日（新しい順）" },
  { id: "added-asc", label: "追加日（古い順）" },
  { id: "title-asc", label: "タイトル（A→Z）" },
  { id: "title-desc", label: "タイトル（Z→A）" },
  { id: "duration-desc", label: "再生時間（長い順）" },
  { id: "duration-asc", label: "再生時間（短い順）" },
];
