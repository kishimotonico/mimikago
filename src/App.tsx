import { useState, useCallback, useEffect } from "react";
import { useLibrary } from "./hooks/useLibrary";
import { usePlayer } from "./hooks/usePlayer";
import Header from "./components/Header";
import SearchConditionsBar from "./components/SearchConditionsBar";
import LibraryGrid from "./components/LibraryGrid";
import LibraryTable from "./components/LibraryTable";
import DetailPanel from "./components/DetailPanel";
import FullView from "./components/FullView";
import PlayerBar from "./components/PlayerBar";
import FullScreenPlayer from "./components/FullScreenPlayer";
import SettingsModal from "./components/SettingsModal";
import NewWorkPopup from "./components/NewWorkPopup";
import { SetupScreen } from "./components/SetupScreen";
import { GRID_SIZES, GRID_SIZE_KEYS } from "./types";
import type { Work, Playlist } from "./types";
import * as api from "./api";

function App() {
  const lib = useLibrary();
  const player = usePlayer();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [fullViewWork, setFullViewWork] = useState<Work | null>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [setupPath, setSetupPath] = useState<string | null>(null);

  // Check if initial setup is needed
  useEffect(() => {
    if (!lib.loading && lib.rootFolder === null) {
      setSetupMode(true);
    }
  }, [lib.loading, lib.rootFolder]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;

      if (e.code === "Space" && player.state.currentWork) {
        e.preventDefault();
        player.togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player]);

  // Load full work data when selected
  useEffect(() => {
    if (lib.selectedWorkId) {
      api.getWork(lib.selectedWorkId).then((w) => {
        if (w) setSelectedWork(w);
      }).catch((e) => console.error("Failed to load work:", e));
    } else {
      setSelectedWork(null);
    }
  }, [lib.selectedWorkId]);

  useEffect(() => {
    if (lib.fullViewWorkId) {
      api.getWork(lib.fullViewWorkId).then((w) => {
        if (w) setFullViewWork(w);
      }).catch((e) => console.error("Failed to load work:", e));
    } else {
      setFullViewWork(null);
    }
  }, [lib.fullViewWorkId]);

  const handleSelectFolder = useCallback(() => {
    const path = window.prompt("ルートフォルダーのパスを入力:");
    if (path) setSetupPath(path);
  }, []);

  const handleSetupComplete = useCallback(
    async (path: string) => {
      await lib.changeRootFolder(path);
      await lib.doScan();
      setSetupMode(false);
    },
    [lib]
  );

  const handleChangeFolder = useCallback(async () => {
    const path = window.prompt(
      "ルートフォルダーのパスを入力:",
      lib.rootFolder || ""
    );
    if (path) await lib.changeRootFolder(path);
  }, [lib]);

  const handlePlay = useCallback(
    (work: Work, trackIndex: number, playlist?: Playlist) => {
      const pl = playlist || work.playlists.find(
        (p) => p.name === (work.defaultPlaylist || "default")
      ) || work.playlists[0];
      const tracks = pl?.tracks || [];
      if (tracks.length > 0) {
        player.play(work, tracks, trackIndex);
      }
    },
    [player]
  );

  const handleOpenFull = useCallback(
    (id: string) => {
      lib.setSelectedWorkId(null);
      lib.setFullViewWorkId(id);
    },
    [lib]
  );

  const handleSelect = useCallback(
    (id: string) => {
      lib.setSelectedWorkId(id === lib.selectedWorkId ? null : id);
    },
    [lib]
  );

  const handleExport = useCallback(async () => {
    try {
      const data = await api.exportLibrary();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mimikago-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
  }, []);

  // Refresh fullViewWork when bookmark/tags change
  const refreshFullViewWork = useCallback(async () => {
    if (fullViewWork) {
      const w = await api.getWork(fullViewWork.id);
      if (w) setFullViewWork(w);
    }
  }, [fullViewWork]);

  const refreshSelectedWork = useCallback(async () => {
    if (selectedWork) {
      const w = await api.getWork(selectedWork.id);
      if (w) setSelectedWork(w);
    }
  }, [selectedWork]);

  const coverSize = GRID_SIZES[GRID_SIZE_KEYS[lib.gridSizeIdx]];
  const isPlayerVisible =
    player.state.currentTrackIndex >= 0 && player.state.currentWork !== null;
  const currentTrack = isPlayerVisible
    ? player.state.tracks[player.state.currentTrackIndex]
    : null;

  if (setupMode) {
    return (
      <SetupScreen
        onFolderSelected={handleSetupComplete}
        onSelectFolder={handleSelectFolder}
        selectedPath={setupPath}
        scanning={lib.scanning}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#13132a",
        color: "#e2e2f0",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', 'Noto Sans JP', sans-serif",
        overflow: "hidden",
      }}
    >
      <Header
        searchQuery={lib.searchQuery}
        setSearchQuery={lib.setSearchQuery}
        onRefresh={lib.doScan}
        onSettingsClick={() => setShowSettings(true)}
        gridSizeIdx={lib.gridSizeIdx}
        setGridSizeIdx={lib.setGridSizeIdx}
        viewMode={lib.viewMode}
        setViewMode={lib.setViewMode}
        scanning={lib.scanning}
      />

      {!fullViewWork && (
        <SearchConditionsBar
          searchQuery={lib.searchQuery}
          setSearchQuery={lib.setSearchQuery}
          tagFilters={lib.tagFilters}
          setTagFilters={lib.setTagFilters}
          sortId={lib.sortId}
          setSortId={lib.setSortId}
          resultCount={lib.works.length}
          searchPresets={lib.searchPresets}
          onSavePreset={lib.savePreset}
          onApplyPreset={lib.applyPreset}
          onDeletePreset={lib.deletePreset}
        />
      )}

      {fullViewWork ? (
        <FullView
          work={fullViewWork}
          onClose={() => lib.setFullViewWorkId(null)}
          onPlay={(i, pl) => handlePlay(fullViewWork, i, pl)}
          playingTrackIndex={
            player.state.currentWork?.id === fullViewWork.id
              ? player.state.currentTrackIndex
              : null
          }
          onUpdateTags={async (tags) => {
            await lib.updateTags(fullViewWork.id, tags);
            refreshFullViewWork();
          }}
          onToggleBookmark={async () => {
            await lib.toggleBookmark(fullViewWork.id);
            refreshFullViewWork();
          }}
          onWorkUpdated={() => {
            refreshFullViewWork();
            lib.loadWorks();
          }}
        />
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {lib.loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#555",
              }}
            >
              読み込み中...
            </div>
          ) : lib.works.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#555",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 40, opacity: 0.3 }}>🎧</div>
              <div style={{ fontSize: 14 }}>作品が見つかりません</div>
              <div style={{ fontSize: 11 }}>
                設定からルートフォルダーを指定してスキャンしてください
              </div>
            </div>
          ) : lib.viewMode === "grid" ? (
            <LibraryGrid
              works={lib.works}
              selectedId={lib.selectedWorkId}
              onSelect={handleSelect}
              onOpenFull={handleOpenFull}
              coverSize={coverSize}
            />
          ) : (
            <LibraryTable
              works={lib.works}
              selectedId={lib.selectedWorkId}
              onSelect={handleSelect}
              onOpenFull={handleOpenFull}
              playingWorkId={player.state.currentWork?.id}
            />
          )}
        </div>
      )}

      {selectedWork && !fullViewWork && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 90 }}
            onClick={() => lib.setSelectedWorkId(null)}
          />
          <DetailPanel
            work={selectedWork}
            onClose={() => lib.setSelectedWorkId(null)}
            onPlay={(i) => handlePlay(selectedWork, i)}
            playingTrackIndex={
              player.state.currentWork?.id === selectedWork.id
                ? player.state.currentTrackIndex
                : null
            }
            onOpenFull={() => handleOpenFull(selectedWork.id)}
            onUpdateTags={async (tags) => {
              await lib.updateTags(selectedWork.id, tags);
              refreshSelectedWork();
            }}
            onToggleBookmark={async () => {
              await lib.toggleBookmark(selectedWork.id);
              refreshSelectedWork();
            }}
          />
        </>
      )}

      {isPlayerVisible && !player.state.showFullPlayer && (
        <PlayerBar
          currentTrack={currentTrack}
          currentWork={player.state.currentWork}
          isPlaying={player.state.isPlaying}
          currentTime={player.state.currentTime}
          duration={player.state.duration}
          volume={player.state.volume}
          loop={player.state.loop}
          playbackRate={player.state.playbackRate}
          channelSwap={player.state.channelSwap}
          abRepeat={player.state.abRepeat}
          onTogglePlay={player.togglePlay}
          onSeek={player.seek}
          onSeekRelative={player.seekRelative}
          onSetVolume={player.setVolume}
          onSetLoop={player.setLoop}
          onNext={player.nextTrack}
          onPrev={player.prevTrack}
          onExpand={() => player.setShowFullPlayer(true)}
          onSetPlaybackRate={player.setPlaybackRate}
          onSetChannelSwap={player.setChannelSwap}
          onSetABPoint={player.setABPoint}
          onClearABRepeat={player.clearABRepeat}
        />
      )}

      {isPlayerVisible && player.state.showFullPlayer && (
        <FullScreenPlayer
          tracks={player.state.tracks}
          currentTrackIndex={player.state.currentTrackIndex}
          currentWork={player.state.currentWork}
          isPlaying={player.state.isPlaying}
          currentTime={player.state.currentTime}
          duration={player.state.duration}
          volume={player.state.volume}
          loop={player.state.loop}
          playbackRate={player.state.playbackRate}
          channelSwap={player.state.channelSwap}
          abRepeat={player.state.abRepeat}
          onTogglePlay={player.togglePlay}
          onSeek={player.seek}
          onSeekRelative={player.seekRelative}
          onSetVolume={player.setVolume}
          onSetLoop={player.setLoop}
          onNext={player.nextTrack}
          onPrev={player.prevTrack}
          onClose={() => player.setShowFullPlayer(false)}
          onSelectTrack={player.setTrackIndex}
          onSetPlaybackRate={player.setPlaybackRate}
          onSetChannelSwap={player.setChannelSwap}
          onSetABPoint={player.setABPoint}
          onClearABRepeat={player.clearABRepeat}
        />
      )}

      {showSettings && (
        <SettingsModal
          rootFolder={lib.rootFolder}
          lastScanTime={lib.lastScanTime}
          scanning={lib.scanning}
          onClose={() => setShowSettings(false)}
          onScan={lib.doScan}
          onChangeFolder={handleChangeFolder}
          onExport={handleExport}
        />
      )}

      {lib.scanResult && (
        <NewWorkPopup
          scanResult={lib.scanResult}
          onClose={() => lib.setScanResult(null)}
        />
      )}

      {isPlayerVisible && !player.state.showFullPlayer && !fullViewWork && (
        <div style={{ height: 72, flexShrink: 0 }} />
      )}
    </div>
  );
}

export default App;
