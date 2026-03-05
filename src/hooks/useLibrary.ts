import { useState, useEffect, useCallback, useMemo } from "react";
import type { WorkSummary, ScanResult, SortId, ViewMode, GridSize } from "../types";
import { GRID_SIZE_KEYS } from "../types";
import * as api from "../api";

export function useLibrary() {
  const [works, setWorks] = useState<WorkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [rootFolder, setRootFolder] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [sortId, setSortId] = useState<SortId>("added-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [gridSizeIdx, setGridSizeIdx] = useState(1); // M
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [fullViewWorkId, setFullViewWorkId] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  const gridSize: GridSize = GRID_SIZE_KEYS[gridSizeIdx];

  const loadWorks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAllWorks();
      setWorks(data);
      const tags = await api.getAllTags();
      setAllTags(tags);
    } catch (e) {
      console.error("Failed to load works:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const root = await api.getRootFolder();
      setRootFolder(root);
      const scanTime = await api.getLastScanTime();
      setLastScanTime(scanTime);
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }, []);

  useEffect(() => {
    loadSettings().then(() => loadWorks());
  }, [loadSettings, loadWorks]);

  const doScan = useCallback(async () => {
    try {
      setScanning(true);
      const result = await api.scanLibrary();
      setScanResult(result);
      await loadWorks();
      const scanTime = await api.getLastScanTime();
      setLastScanTime(scanTime);
    } catch (e) {
      console.error("Scan failed:", e);
    } finally {
      setScanning(false);
    }
  }, [loadWorks]);

  const changeRootFolder = useCallback(
    async (path: string) => {
      try {
        await api.setRootFolder(path);
        setRootFolder(path);
      } catch (e) {
        console.error("Failed to set root folder:", e);
      }
    },
    []
  );

  // Filtering and sorting
  const filteredWorks = useMemo(() => {
    let result = [...works];

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Tag filters
    if (tagFilters.length > 0) {
      result = result.filter((w) =>
        tagFilters.every((tf) =>
          w.tags.some((t) => t.toLowerCase().includes(tf.toLowerCase()))
        )
      );
    }

    // Sort
    switch (sortId) {
      case "added-desc":
        result.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
        break;
      case "added-asc":
        result.sort((a, b) => a.addedAt.localeCompare(b.addedAt));
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "duration-desc":
        result.sort((a, b) => b.totalDurationSec - a.totalDurationSec);
        break;
      case "duration-asc":
        result.sort((a, b) => a.totalDurationSec - b.totalDurationSec);
        break;
    }

    return result;
  }, [works, searchQuery, tagFilters, sortId]);

  const updateTags = useCallback(
    async (workId: string, tags: string[]) => {
      try {
        await api.updateWorkTags(workId, tags);
        await loadWorks();
      } catch (e) {
        console.error("Failed to update tags:", e);
      }
    },
    [loadWorks]
  );

  return {
    works: filteredWorks,
    allWorks: works,
    loading,
    scanning,
    rootFolder,
    lastScanTime,
    scanResult,
    setScanResult,
    searchQuery,
    setSearchQuery,
    tagFilters,
    setTagFilters,
    sortId,
    setSortId,
    viewMode,
    setViewMode,
    gridSizeIdx,
    setGridSizeIdx,
    gridSize,
    selectedWorkId,
    setSelectedWorkId,
    fullViewWorkId,
    setFullViewWorkId,
    allTags,
    doScan,
    changeRootFolder,
    loadWorks,
    updateTags,
  };
}
