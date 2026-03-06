import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { WorkSummary, ScanResult, SortId, ViewMode, GridSize, SearchPreset } from "../types";
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
  const [searchPresets, setSearchPresets] = useState<SearchPreset[]>([]);

  // Random sort seed - changes when sort is set to random
  const randomSeedRef = useRef(Math.random());

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

  const loadPresets = useCallback(async () => {
    try {
      const presets = await api.getSearchPresets();
      setSearchPresets(presets);
    } catch (e) {
      console.error("Failed to load presets:", e);
    }
  }, []);

  useEffect(() => {
    loadSettings().then(() => {
      loadWorks();
      loadPresets();
    });
  }, [loadSettings, loadWorks, loadPresets]);

  // Auto-scan on startup if root folder is set
  const hasAutoScanned = useRef(false);
  useEffect(() => {
    if (!loading && rootFolder && !hasAutoScanned.current) {
      hasAutoScanned.current = true;
      // Quick scan on startup
      setScanning(true);
      api.scanLibrary().then((result) => {
        if (result.newlyGenerated > 0 || result.errors > 0 || result.missing > 0) {
          setScanResult(result);
        }
        loadWorks();
        api.getLastScanTime().then(setLastScanTime);
      }).catch((e) => {
        console.error("Auto-scan failed:", e);
      }).finally(() => {
        setScanning(false);
      });
    }
  }, [loading, rootFolder, loadWorks]);

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

    // Text search with advanced syntax
    if (searchQuery) {
      const tokens = parseSearchQuery(searchQuery);
      result = result.filter((w) => matchesSearchTokens(w, tokens));
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
      case "last-played":
        result.sort((a, b) => {
          if (!a.lastPlayedAt && !b.lastPlayedAt) return 0;
          if (!a.lastPlayedAt) return 1;
          if (!b.lastPlayedAt) return -1;
          return b.lastPlayedAt.localeCompare(a.lastPlayedAt);
        });
        break;
      case "random": {
        const seed = randomSeedRef.current;
        result.sort((a, b) => {
          const ha = hashStr(a.id + seed);
          const hb = hashStr(b.id + seed);
          return ha - hb;
        });
        break;
      }
      case "id-asc":
        result.sort((a, b) => a.id.localeCompare(b.id));
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

  const toggleBookmark = useCallback(
    async (workId: string) => {
      try {
        await api.toggleBookmark(workId);
        await loadWorks();
      } catch (e) {
        console.error("Failed to toggle bookmark:", e);
      }
    },
    [loadWorks]
  );

  const handleSetSortId = useCallback((id: SortId) => {
    if (id === "random") {
      randomSeedRef.current = Math.random();
    }
    setSortId(id);
  }, []);

  const savePreset = useCallback(
    async (name: string) => {
      try {
        await api.saveSearchPreset(name, searchQuery, tagFilters, sortId);
        await loadPresets();
      } catch (e) {
        console.error("Failed to save preset:", e);
      }
    },
    [searchQuery, tagFilters, sortId, loadPresets]
  );

  const applyPreset = useCallback((preset: SearchPreset) => {
    setSearchQuery(preset.query);
    setTagFilters(preset.tagFilters);
    setSortId(preset.sortId as SortId);
  }, []);

  const deletePreset = useCallback(
    async (id: number) => {
      try {
        await api.deleteSearchPreset(id);
        await loadPresets();
      } catch (e) {
        console.error("Failed to delete preset:", e);
      }
    },
    [loadPresets]
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
    setSortId: handleSetSortId,
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
    toggleBookmark,
    searchPresets,
    savePreset,
    applyPreset,
    deletePreset,
  };
}

// Simple hash for deterministic random sort
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}

// Advanced search: supports AND (space), OR (|), exclude (-prefix)
interface SearchToken {
  term: string;
  exclude: boolean;
  or: boolean;
}

function parseSearchQuery(query: string): SearchToken[][] {
  // Split by space for AND groups, | within a group for OR
  const groups: SearchToken[][] = [];
  const parts = query.trim().split(/\s+/);

  for (const part of parts) {
    if (!part) continue;
    const orTerms = part.split("|").filter(Boolean);
    const group: SearchToken[] = orTerms.map((t) => {
      if (t.startsWith("-") && t.length > 1) {
        return { term: t.slice(1).toLowerCase(), exclude: true, or: false };
      }
      return { term: t.toLowerCase(), exclude: false, or: false };
    });
    groups.push(group);
  }
  return groups;
}

function matchesSearchTokens(work: WorkSummary, groups: SearchToken[][]): boolean {
  const title = work.title.toLowerCase();
  const tags = work.tags.map((t) => t.toLowerCase());

  for (const group of groups) {
    if (group.length === 0) continue;

    // Check if ANY term in the OR group matches
    const hasExclude = group.some((t) => t.exclude);
    const hasInclude = group.some((t) => !t.exclude);

    if (hasExclude) {
      // For exclude terms, ALL must not match
      for (const token of group.filter((t) => t.exclude)) {
        if (title.includes(token.term) || tags.some((t) => t.includes(token.term))) {
          return false;
        }
      }
    }

    if (hasInclude) {
      // For include terms (possibly OR'd), at least one must match
      const includeTerms = group.filter((t) => !t.exclude);
      const anyMatch = includeTerms.some((token) =>
        title.includes(token.term) || tags.some((t) => t.includes(token.term))
      );
      if (!anyMatch) return false;
    }
  }

  return true;
}
