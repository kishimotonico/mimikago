import { invoke } from "@tauri-apps/api/core";
import type { Work, WorkSummary, ScanResult } from "./types";

export async function getRootFolder(): Promise<string | null> {
  return invoke<string | null>("get_root_folder");
}

export async function setRootFolder(path: string): Promise<void> {
  return invoke("set_root_folder", { path });
}

export async function scanLibrary(): Promise<ScanResult> {
  return invoke<ScanResult>("scan_library");
}

export async function getAllWorks(): Promise<WorkSummary[]> {
  return invoke<WorkSummary[]>("get_all_works");
}

export async function getWork(id: string): Promise<Work | null> {
  return invoke<Work | null>("get_work", { id });
}

export async function searchWorks(
  query: string,
  tagFilters: string[]
): Promise<WorkSummary[]> {
  return invoke<WorkSummary[]>("search_works", { query, tagFilters });
}

export async function updateWorkTags(
  workId: string,
  tags: string[]
): Promise<void> {
  return invoke("update_work_tags", { workId, tags });
}

export async function updateWorkTitle(
  workId: string,
  title: string
): Promise<void> {
  return invoke("update_work_title", { workId, title });
}

export async function getAllTags(): Promise<string[]> {
  return invoke<string[]>("get_all_tags");
}

export async function getCoverImagePath(
  workId: string
): Promise<string | null> {
  return invoke<string | null>("get_cover_image_path", { workId });
}

export async function getAudioFilePath(
  workId: string,
  relativePath: string
): Promise<string | null> {
  return invoke<string | null>("get_audio_file_path", {
    workId,
    relativePath,
  });
}

export async function getLastScanTime(): Promise<string | null> {
  return invoke<string | null>("get_last_scan_time");
}
