import React, { useEffect } from "react";
import type { Work, Track } from "../types";
import CoverImage from "./CoverImage";
import UrlButtons from "./UrlButtons";
import { formatTime } from "../hooks/usePlayer";

interface DetailPanelProps {
  work: Work;
  onClose: () => void;
  onPlay: (trackIndex: number) => void;
  playingTrackIndex: number | null;
  onOpenFull: () => void;
  onUpdateTags: (tags: string[]) => void;
}

const C = {
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

const keyframesInjected = (() => {
  if (typeof document !== "undefined") {
    const id = "detail-panel-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  return true;
})();

const DetailPanel: React.FC<DetailPanelProps> = ({
  work,
  onClose,
  onPlay,
  playingTrackIndex,
  onOpenFull,
  onUpdateTags,
}) => {
  void keyframesInjected;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const tracks: Track[] =
    work.playlists.length > 0 ? work.playlists[0].tracks : [];

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

  const isAnnotated = (tag: string) => tag.includes("/");

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    right: 0,
    top: 52,
    bottom: 0,
    width: 370,
    zIndex: 100,
    background: C.bgSurface,
    borderLeft: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    animation: "slideInRight 0.2s ease-out",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: `1px solid ${C.border}`,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: 14,
  };

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
    padding: "5px 8px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    color: isPlaying ? C.accent : C.textPrimary,
    background: isPlaying ? C.accentDim : "transparent",
    transition: "background 0.12s",
  });

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ color: C.textSecondary, fontSize: 12 }}>
          クイックビュー
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onOpenFull}
            style={{
              background: "none",
              border: "none",
              color: C.accent,
              fontSize: 12,
              cursor: "pointer",
              padding: "2px 4px",
            }}
          >
            詳細を開く &#x2197;
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.textSecondary,
              fontSize: 16,
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            &#x2715;
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={contentStyle}>
        {/* Cover + basic info */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <CoverImage
            workId={work.id}
            coverImage={work.coverImage}
            physicalPath={work.physicalPath}
            size={90}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: C.textPrimary,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.3,
                marginBottom: 4,
                wordBreak: "break-word",
              }}
            >
              {work.title}
            </div>
            <div style={{ color: C.textSecondary, fontSize: 11 }}>
              {tracks.length} トラック / {formatTime(work.totalDurationSec)}
            </div>
          </div>
        </div>

        {/* Error message */}
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
              {work.status === "missing" ? "行方不明" : "エラー"}
            </div>
            {work.errorMessage && (
              <div style={{ color: C.textSecondary, fontSize: 11, wordBreak: "break-word" }}>
                {work.errorMessage}
              </div>
            )}
          </div>
        )}

        {/* URL buttons */}
        {work.urls.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <UrlButtons urls={work.urls} compact />
          </div>
        )}

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
                    background: annotated ? C.accentDim : "#252540",
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

        {/* Track list */}
        <div>
          <div
            style={{
              color: C.textSecondary,
              fontSize: 11,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            トラック
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {tracks.map((track, i) => {
              const isActive = playingTrackIndex === i;
              return (
                <div
                  key={i}
                  style={trackRowStyle(isActive)}
                  onClick={() => onPlay(i)}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      textAlign: "right",
                      color: isActive ? C.accent : C.textDisabled,
                      fontSize: 11,
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
                  {track.start !== undefined && track.end !== undefined && (
                    <span
                      style={{
                        color: isActive ? C.accent : C.textDisabled,
                        fontSize: 11,
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
      </div>
    </div>
  );
};

export default DetailPanel;
