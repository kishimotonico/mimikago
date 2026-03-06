import React, { useState, useEffect, useCallback } from "react";
import type { Work, Track, Playlist, FileEntry, DlsiteWorkInfo } from "../types";
import CoverImage from "./CoverImage";
import UrlButtons from "./UrlButtons";
import { formatTime, formatFileSize } from "../hooks/usePlayer";
import * as api from "../api";

interface FullViewProps {
  work: Work;
  onClose: () => void;
  onPlay: (trackIndex: number, playlist?: Playlist) => void;
  playingTrackIndex: number | null;
  onUpdateTags: (tags: string[]) => void;
  onToggleBookmark: () => void;
  onWorkUpdated?: () => void;
}

const C = {
  bgMain: "#13132a",
  bgSurface: "#1c1c32",
  bgInput: "#252540",
  border: "#2a2a40",
  borderLight: "#3a3a55",
  textPrimary: "#e2e2f0",
  textSecondary: "#888",
  textDisabled: "#555",
  accent: "#5b8def",
  accentDim: "rgba(91,141,239,0.08)",
  error: "#e53e3e",
};

type TabId = "tracks" | "files";

const FILE_ICONS: Record<string, string> = {
  directory: "\uD83D\uDCC1",
  audio: "\uD83D\uDD0A",
  image: "\uD83D\uDDBC",
  pdf: "\uD83D\uDCC4",
  text: "\uD83D\uDCC4",
  other: "\uD83D\uDCC4",
};

const FullView: React.FC<FullViewProps> = ({
  work,
  onClose,
  onPlay,
  playingTrackIndex,
  onUpdateTags,
  onToggleBookmark,
  onWorkUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("tracks");
  const [dlsiteInfo, setDlsiteInfo] = useState<DlsiteWorkInfo | null>(null);
  const [dlsiteFetching, setDlsiteFetching] = useState(false);
  const [dlsiteError, setDlsiteError] = useState<string | null>(null);
  const [dlsiteApplying, setDlsiteApplying] = useState(false);
  const [fileTree, setFileTree] = useState<FileEntry | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>(
    work.defaultPlaylist || work.playlists[0]?.name || "default"
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (imagePreview) {
          setImagePreview(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, imagePreview]);

  // Load file tree when files tab is active
  useEffect(() => {
    if (activeTab === "files" && !fileTree) {
      setLoadingFiles(true);
      api.listWorkFiles(work.id).then((tree) => {
        setFileTree(tree);
      }).catch((e) => {
        console.error("Failed to load files:", e);
      }).finally(() => {
        setLoadingFiles(false);
      });
    }
  }, [activeTab, fileTree, work.id]);

  const currentPlaylist = work.playlists.find((p) => p.name === selectedPlaylist) || work.playlists[0];
  const tracks: Track[] = currentPlaylist?.tracks || [];

  const isAnnotated = (tag: string) => tag.includes("/");

  const handleRemoveTag = (index: number) => {
    const next = work.tags.filter((_, i) => i !== index);
    onUpdateTags(next);
  };

  const handleAddTag = () => {
    const value = window.prompt("タグを入力");
    if (value && value.trim()) {
      onUpdateTags([...work.tags, value.trim()]);
    }
  };

  const handleFetchDlsite = async () => {
    setDlsiteFetching(true);
    setDlsiteError(null);
    setDlsiteInfo(null);
    try {
      const info = await api.fetchDlsiteInfo(work.id);
      setDlsiteInfo(info);
    } catch (e: unknown) {
      setDlsiteError(e instanceof Error ? e.message : String(e));
    } finally {
      setDlsiteFetching(false);
    }
  };

  const handleApplyDlsite = async (applyTitle: boolean, applyTags: boolean, applyCover: boolean) => {
    if (!dlsiteInfo) return;
    setDlsiteApplying(true);
    try {
      await api.applyDlsiteInfo(work.id, dlsiteInfo, applyTitle, applyTags, applyCover);
      setDlsiteInfo(null);
      onWorkUpdated?.();
    } catch (e: unknown) {
      setDlsiteError(e instanceof Error ? e.message : String(e));
    } finally {
      setDlsiteApplying(false);
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) onPlay(0, currentPlaylist);
  };

  const handleFileClick = useCallback((entry: FileEntry) => {
    if (entry.fileType === "audio") {
      // Play this audio file directly
      const assetUrl = window.__TAURI__
        ? `asset://localhost/${(work.physicalPath + "/" + entry.path).split("/").map(encodeURIComponent).join("/")}`
        : entry.path;
      const audio = new Audio(assetUrl);
      audio.play().catch(() => {});
    } else if (entry.fileType === "image") {
      const assetUrl = window.__TAURI__
        ? `asset://localhost/${(work.physicalPath + "/" + entry.path).split("/").map(encodeURIComponent).join("/")}`
        : entry.path;
      setImagePreview(assetUrl);
    }
  }, [work.physicalPath]);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 52,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    background: C.bgMain,
    display: "flex",
    flexDirection: "column",
  };

  const topBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 16px",
    borderBottom: `1px solid ${C.border}`,
    background: C.bgSurface,
    flexShrink: 0,
  };

  const sidebarStyle: React.CSSProperties = {
    width: 300,
    flexShrink: 0,
    borderRight: `1px solid ${C.border}`,
    overflowY: "auto",
    padding: 16,
    background: C.bgSurface,
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px",
    fontSize: 13,
    color: active ? C.accent : C.textSecondary,
    borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
    background: "none",
    border: "none",
    borderBottomStyle: "solid",
    borderBottomWidth: 2,
    borderBottomColor: active ? C.accent : "transparent",
    cursor: "pointer",
    transition: "color 0.12s",
  });

  const tagBaseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    lineHeight: 1.4,
    cursor: "default",
  };

  const tagDeleteStyle: React.CSSProperties = {
    cursor: "pointer",
    marginLeft: 2,
    opacity: 0.6,
    fontSize: 10,
  };

  const trackRowStyle = (isPlaying: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 13,
    color: isPlaying ? C.accent : C.textPrimary,
    background: isPlaying ? C.accentDim : "transparent",
    transition: "background 0.12s",
  });

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleDateString("ja-JP"); } catch { return d; }
  };

  return (
    <div style={containerStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: C.textSecondary, fontSize: 13, cursor: "pointer", padding: "4px 8px", borderRadius: 4 }}
        >
          &#x2190; 戻る
        </button>
        <span style={{ color: C.textPrimary, fontSize: 14, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {work.title}
        </span>
        {work.urls.length > 0 && <UrlButtons urls={work.urls} compact />}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left sidebar */}
        <div style={sidebarStyle}>
          <CoverImage
            workId={work.id}
            coverImage={work.coverImage}
            physicalPath={work.physicalPath}
            size={260}
            bookmarked={work.bookmarked}
            style={{ marginBottom: 14, borderRadius: 8 }}
          />

          <div style={{ color: C.textPrimary, fontSize: 16, fontWeight: 600, lineHeight: 1.3, marginBottom: 6, wordBreak: "break-word" }}>
            {work.title}
          </div>

          <div style={{ color: C.textSecondary, fontSize: 12, marginBottom: 8 }}>
            {tracks.length} トラック / {formatTime(work.totalDurationSec)}
          </div>

          {/* Bookmark button */}
          <button
            onClick={onToggleBookmark}
            style={{
              background: work.bookmarked ? C.accentDim : "transparent",
              border: `1px solid ${work.bookmarked ? "rgba(91,141,239,0.3)" : C.borderLight}`,
              color: work.bookmarked ? C.accent : C.textSecondary,
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg viewBox="0 0 12 16" fill="currentColor" width={12} height={16}>
              <path d="M1 0h10a1 1 0 011 1v14.5a.5.5 0 01-.8.4L6 12l-5.2 3.9A.5.5 0 010 15.5V1a1 1 0 011-1z" />
            </svg>
            {work.bookmarked ? "ブックマーク済み" : "ブックマーク"}
          </button>

          {/* DLsite fetch */}
          <button
            onClick={handleFetchDlsite}
            disabled={dlsiteFetching}
            style={{
              background: "transparent",
              border: `1px solid ${C.borderLight}`,
              color: dlsiteFetching ? C.textDisabled : C.textSecondary,
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              cursor: dlsiteFetching ? "default" : "pointer",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {dlsiteFetching ? "取得中..." : "DLsite情報を取得"}
          </button>

          {dlsiteError && (
            <div style={{ color: C.error, fontSize: 11, marginBottom: 8, wordBreak: "break-word" }}>
              {dlsiteError}
            </div>
          )}

          {dlsiteInfo && (
            <div style={{
              marginBottom: 14,
              padding: 10,
              borderRadius: 6,
              background: C.bgInput,
              border: `1px solid ${C.borderLight}`,
              fontSize: 12,
            }}>
              <div style={{ fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>
                {dlsiteInfo.rjCode} - DLsite情報
              </div>
              <div style={{ color: C.textSecondary, marginBottom: 4 }}>
                <span style={{ color: C.textDisabled }}>タイトル: </span>{dlsiteInfo.title}
              </div>
              {dlsiteInfo.circle && (
                <div style={{ color: C.textSecondary, marginBottom: 4 }}>
                  <span style={{ color: C.textDisabled }}>サークル: </span>{dlsiteInfo.circle}
                </div>
              )}
              {dlsiteInfo.cvs.length > 0 && (
                <div style={{ color: C.textSecondary, marginBottom: 4 }}>
                  <span style={{ color: C.textDisabled }}>CV: </span>{dlsiteInfo.cvs.join(", ")}
                </div>
              )}
              {dlsiteInfo.genreTags.length > 0 && (
                <div style={{ color: C.textSecondary, marginBottom: 4 }}>
                  <span style={{ color: C.textDisabled }}>ジャンル: </span>{dlsiteInfo.genreTags.join(", ")}
                </div>
              )}
              {dlsiteInfo.coverUrl && (
                <div style={{ color: C.textSecondary, marginBottom: 6 }}>
                  <span style={{ color: C.textDisabled }}>カバー画像: </span>あり
                </div>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                <button
                  onClick={() => handleApplyDlsite(true, true, true)}
                  disabled={dlsiteApplying}
                  style={{
                    background: C.accent,
                    border: "none",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "4px 10px",
                    fontSize: 11,
                    cursor: dlsiteApplying ? "default" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {dlsiteApplying ? "適用中..." : "すべて適用"}
                </button>
                <button
                  onClick={() => handleApplyDlsite(false, true, false)}
                  disabled={dlsiteApplying}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.borderLight}`,
                    color: C.textSecondary,
                    borderRadius: 4,
                    padding: "4px 8px",
                    fontSize: 11,
                    cursor: dlsiteApplying ? "default" : "pointer",
                  }}
                >
                  タグのみ
                </button>
                <button
                  onClick={() => handleApplyDlsite(true, false, false)}
                  disabled={dlsiteApplying}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.borderLight}`,
                    color: C.textSecondary,
                    borderRadius: 4,
                    padding: "4px 8px",
                    fontSize: 11,
                    cursor: dlsiteApplying ? "default" : "pointer",
                  }}
                >
                  タイトルのみ
                </button>
                <button
                  onClick={() => setDlsiteInfo(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.textDisabled,
                    fontSize: 11,
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          )}

          {/* Last played */}
          {work.lastPlayedAt && (
            <div style={{ color: C.textSecondary, fontSize: 11, marginBottom: 14 }}>
              最終再生: {formatDate(work.lastPlayedAt)}
            </div>
          )}

          {/* Error/Missing message */}
          {(work.status === "error" || work.status === "missing" || work.errorMessage) && (
            <div
              style={{
                marginBottom: 14,
                padding: "8px 10px",
                borderRadius: 6,
                background: work.status === "missing" ? "rgba(214,158,46,0.08)" : "rgba(229,62,62,0.08)",
                border: `1px solid ${work.status === "missing" ? "rgba(214,158,46,0.2)" : "rgba(229,62,62,0.2)"}`,
                fontSize: 12,
                color: work.status === "missing" ? "#d69e2e" : C.error,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: work.errorMessage ? 4 : 0 }}>
                {work.status === "missing" ? "行方不明: この作品のフォルダーが見つかりません" : "エラー"}
              </div>
              {work.errorMessage && (
                <div style={{ color: C.textSecondary, fontSize: 11, wordBreak: "break-word" }}>
                  {work.errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: C.textSecondary, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
              タグ
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {work.tags.map((tag, i) => {
                const annotated = isAnnotated(tag);
                return (
                  <span
                    key={i}
                    style={{
                      ...tagBaseStyle,
                      background: annotated ? C.accentDim : C.bgInput,
                      color: annotated ? C.accent : C.textSecondary,
                      border: `1px solid ${annotated ? "rgba(91,141,239,0.2)" : C.borderLight}`,
                    }}
                  >
                    {tag}
                    <span
                      style={tagDeleteStyle}
                      onClick={() => handleRemoveTag(i)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleRemoveTag(i); }}
                      role="button"
                      tabIndex={0}
                      aria-label={`タグ「${tag}」を削除`}
                    >
                      &#x2715;
                    </span>
                  </span>
                );
              })}
              <button
                onClick={handleAddTag}
                style={{ ...tagBaseStyle, background: "transparent", border: `1px dashed ${C.borderLight}`, color: C.textSecondary, cursor: "pointer", fontSize: 11 }}
              >
                + 追加
              </button>
            </div>
          </div>

          {/* Meta info */}
          <div style={{ fontSize: 11, color: C.textDisabled, display: "flex", flexDirection: "column", gap: 4 }}>
            <div>
              <span style={{ color: C.textSecondary }}>パス: </span>
              <span style={{ wordBreak: "break-all" }}>{work.physicalPath}</span>
            </div>
            <div>
              <span style={{ color: C.textSecondary }}>追加日: </span>
              {formatDate(work.addedAt)}
            </div>
          </div>
        </div>

        {/* Right main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <button style={tabStyle(activeTab === "tracks")} onClick={() => setActiveTab("tracks")}>
              トラック
            </button>
            <button style={tabStyle(activeTab === "files")} onClick={() => setActiveTab("files")}>
              ファイル
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {activeTab === "tracks" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <button
                    onClick={handlePlayAll}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      fontSize: 13,
                      color: C.accent,
                      background: C.accentDim,
                      border: `1px solid rgba(91,141,239,0.2)`,
                      borderRadius: 6,
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(91,141,239,0.16)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.accentDim; }}
                  >
                    &#x25B6; すべて再生
                  </button>

                  {/* Playlist selector */}
                  {work.playlists.length > 1 && (
                    <select
                      value={selectedPlaylist}
                      onChange={(e) => setSelectedPlaylist(e.target.value)}
                      style={{
                        background: C.bgInput,
                        color: C.textPrimary,
                        border: `1px solid ${C.borderLight}`,
                        borderRadius: 4,
                        padding: "4px 8px",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {work.playlists.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {tracks.map((track, i) => {
                    const isActive = playingTrackIndex === i;
                    return (
                      <div
                        key={i}
                        style={trackRowStyle(isActive)}
                        onClick={() => onPlay(i, currentPlaylist)}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span style={{ width: 26, textAlign: "right", color: isActive ? C.accent : C.textDisabled, fontSize: 12, flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {track.title}
                        </span>
                        {track.start !== undefined && track.end !== undefined && (
                          <span style={{ color: isActive ? C.accent : C.textDisabled, fontSize: 12, flexShrink: 0 }}>
                            {formatTime(track.end - track.start)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div>
                {/* Image preview */}
                {imagePreview && (
                  <div style={{ marginBottom: 16, textAlign: "center" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, border: `1px solid ${C.border}` }}
                      onError={() => setImagePreview(null)}
                    />
                    <button
                      onClick={() => setImagePreview(null)}
                      style={{ display: "block", margin: "8px auto", background: "none", border: "none", color: C.textSecondary, cursor: "pointer", fontSize: 12 }}
                    >
                      プレビューを閉じる
                    </button>
                  </div>
                )}

                {loadingFiles ? (
                  <div style={{ color: C.textDisabled, fontSize: 13, padding: "40px 0", textAlign: "center" }}>
                    読み込み中...
                  </div>
                ) : fileTree ? (
                  <FileTreeView entry={fileTree} depth={0} onFileClick={handleFileClick} />
                ) : (
                  <div style={{ color: C.textDisabled, fontSize: 13, padding: "40px 0", textAlign: "center" }}>
                    ファイル情報を取得できませんでした
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function FileTreeView({ entry, depth, onFileClick }: { entry: FileEntry; depth: number; onFileClick: (e: FileEntry) => void }) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (entry.isDir) {
    return (
      <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 6px",
            cursor: "pointer",
            fontSize: 13,
            color: "#e2e2f0",
            borderRadius: 4,
          }}
        >
          <span style={{ fontSize: 10, color: "#888", width: 12 }}>{expanded ? "▼" : "▶"}</span>
          <span>{FILE_ICONS.directory}</span>
          <span>{entry.name || "/"}</span>
          <span style={{ color: "#555", fontSize: 11 }}>({entry.children.length})</span>
        </div>
        {expanded && entry.children.map((child, i) => (
          <FileTreeView key={i} entry={child} depth={depth + 1} onFileClick={onFileClick} />
        ))}
      </div>
    );
  }

  const icon = FILE_ICONS[entry.fileType] || FILE_ICONS.other;
  const isClickable = entry.fileType === "audio" || entry.fileType === "image";

  return (
    <div
      onClick={isClickable ? () => onFileClick(entry) : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 6px",
        marginLeft: depth > 0 ? 16 : 0,
        cursor: isClickable ? "pointer" : "default",
        fontSize: 13,
        color: isClickable ? "#e2e2f0" : "#888",
        borderRadius: 4,
      }}
    >
      <span style={{ width: 12 }} />
      <span>{icon}</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</span>
      <span style={{ color: "#555", fontSize: 11, flexShrink: 0 }}>{formatFileSize(entry.size)}</span>
      {entry.fileType === "audio" && (
        <span style={{ color: "#5b8def", fontSize: 11, flexShrink: 0 }}>▶ 再生</span>
      )}
    </div>
  );
}

export default FullView;
