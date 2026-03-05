import React, { useState, useEffect } from "react";
import type { Work, Track } from "../types";
import CoverImage from "./CoverImage";
import UrlButtons from "./UrlButtons";
import { formatTime } from "../hooks/usePlayer";

interface FullViewProps {
  work: Work;
  onClose: () => void;
  onPlay: (trackIndex: number) => void;
  playingTrackIndex: number | null;
  onUpdateTags: (tags: string[]) => void;
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

const FullView: React.FC<FullViewProps> = ({
  work,
  onClose,
  onPlay,
  playingTrackIndex,
  onUpdateTags,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("tracks");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const tracks: Track[] =
    work.playlists.length > 0 ? work.playlists[0].tracks : [];

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

  const handlePlayAll = () => {
    if (tracks.length > 0) onPlay(0);
  };

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

  const bodyStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  };

  const sidebarStyle: React.CSSProperties = {
    width: 300,
    flexShrink: 0,
    borderRight: `1px solid ${C.border}`,
    overflowY: "auto",
    padding: 16,
    background: C.bgSurface,
  };

  const mainAreaStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const tabBarStyle: React.CSSProperties = {
    display: "flex",
    borderBottom: `1px solid ${C.border}`,
    flexShrink: 0,
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
    try {
      return new Date(d).toLocaleDateString("ja-JP");
    } catch {
      return d;
    }
  };

  return (
    <div style={containerStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: C.textSecondary,
            fontSize: 13,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 4,
          }}
        >
          &#x2190; 戻る
        </button>
        <span
          style={{
            color: C.textPrimary,
            fontSize: 14,
            fontWeight: 600,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {work.title}
        </span>
        {work.urls.length > 0 && <UrlButtons urls={work.urls} compact />}
      </div>

      <div style={bodyStyle}>
        {/* Left sidebar */}
        <div style={sidebarStyle}>
          <CoverImage
            workId={work.id}
            coverImage={work.coverImage}
            physicalPath={work.physicalPath}
            size={260}
            style={{ marginBottom: 14, borderRadius: 8 }}
          />

          <div
            style={{
              color: C.textPrimary,
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: 6,
              wordBreak: "break-word",
            }}
          >
            {work.title}
          </div>

          <div
            style={{ color: C.textSecondary, fontSize: 12, marginBottom: 14 }}
          >
            {tracks.length} トラック / {formatTime(work.totalDurationSec)}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                color: C.textSecondary,
                fontSize: 11,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
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
                style={{
                  ...tagBaseStyle,
                  background: "transparent",
                  border: `1px dashed ${C.borderLight}`,
                  color: C.textSecondary,
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                + 追加
              </button>
            </div>
          </div>

          {/* Meta info */}
          <div
            style={{
              fontSize: 11,
              color: C.textDisabled,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div>
              <span style={{ color: C.textSecondary }}>パス: </span>
              <span style={{ wordBreak: "break-all" }}>
                {work.physicalPath}
              </span>
            </div>
            <div>
              <span style={{ color: C.textSecondary }}>追加日: </span>
              {formatDate(work.addedAt)}
            </div>
          </div>
        </div>

        {/* Right main area */}
        <div style={mainAreaStyle}>
          {/* Tab bar */}
          <div style={tabBarStyle}>
            <button
              style={tabStyle(activeTab === "tracks")}
              onClick={() => setActiveTab("tracks")}
            >
              トラック
            </button>
            <button
              style={tabStyle(activeTab === "files")}
              onClick={() => setActiveTab("files")}
            >
              ファイル
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {activeTab === "tracks" && (
              <div>
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
                    marginBottom: 12,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(91,141,239,0.16)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = C.accentDim;
                  }}
                >
                  &#x25B6; すべて再生
                </button>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {tracks.map((track, i) => {
                    const isActive = playingTrackIndex === i;
                    return (
                      <div
                        key={i}
                        style={trackRowStyle(isActive)}
                        onClick={() => onPlay(i)}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span
                          style={{
                            width: 26,
                            textAlign: "right",
                            color: isActive ? C.accent : C.textDisabled,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {track.title}
                        </span>
                        {track.start !== undefined &&
                          track.end !== undefined && (
                            <span
                              style={{
                                color: isActive ? C.accent : C.textDisabled,
                                fontSize: 12,
                                flexShrink: 0,
                              }}
                            >
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
              <div
                style={{
                  color: C.textDisabled,
                  fontSize: 13,
                  padding: "40px 0",
                  textAlign: "center",
                }}
              >
                フェーズ2で実装予定
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullView;
