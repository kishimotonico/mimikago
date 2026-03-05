import React, { useCallback } from "react";
import type { Track, WorkSummary, Work } from "../types";
import CoverImage from "./CoverImage";
import { formatTime } from "../hooks/usePlayer";

interface FullScreenPlayerProps {
  tracks: Track[];
  currentTrackIndex: number;
  currentWork: WorkSummary | Work | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  loop: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSeekRelative: (delta: number) => void;
  onSetVolume: (vol: number) => void;
  onSetLoop: (loop: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onSelectTrack: (index: number) => void;
}

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#e2e2f0",
  cursor: "pointer",
  fontSize: 22,
  padding: "6px 8px",
  lineHeight: 1,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const slideUpKeyframes = `
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
`;

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  tracks,
  currentTrackIndex,
  currentWork,
  isPlaying,
  currentTime,
  duration,
  volume,
  loop,
  onTogglePlay,
  onSeek,
  onSeekRelative,
  onSetVolume,
  onSetLoop,
  onNext,
  onPrev,
  onClose,
  onSelectTrack,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentTrack = currentTrackIndex >= 0 && currentTrackIndex < tracks.length
    ? tracks[currentTrackIndex]
    : null;

  const handleSeekClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (duration <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSetVolume(Math.round(ratio * 100));
    },
    [onSetVolume]
  );

  const urls = currentWork?.urls ?? [];

  return (
    <>
      <style>{slideUpKeyframes}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: "#0c0c1a",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.25s ease-out",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#e2e2f0",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {"\u25BC"} {"\u9589\u3058\u308B"}
          </button>
          <span style={{ color: "#888", fontSize: 12 }}>{"\u518D\u751F\u4E2D"}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {urls.map((u, i) => (
              <a
                key={i}
                href={u.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#5b8def",
                  fontSize: 12,
                  textDecoration: "none",
                  padding: "3px 8px",
                  border: "1px solid #3a3a55",
                  borderRadius: 4,
                }}
              >
                {u.label}
              </a>
            ))}
          </div>
        </div>

        {/* Center content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "0 20px",
            minHeight: 0,
          }}
        >
          {/* Cover */}
          {currentWork ? (
            <CoverImage
              workId={currentWork.id}
              coverImage={currentWork.coverImage}
              physicalPath={currentWork?.physicalPath}
              size={220}
              style={{ borderRadius: 10 }}
            />
          ) : (
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: 10,
                background: "#1c1c32",
              }}
            />
          )}

          {/* Track title */}
          <div
            style={{
              color: "#e2e2f0",
              fontSize: 20,
              fontWeight: 700,
              textAlign: "center",
              maxWidth: 480,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentTrack?.title || "\u00A0"}
          </div>

          {/* Work title */}
          <div
            style={{
              color: "#888",
              fontSize: 14,
              textAlign: "center",
              maxWidth: 480,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentWork?.title || "\u00A0"}
          </div>

          {/* Seek bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              maxWidth: 560,
            }}
          >
            <span style={{ color: "#888", fontSize: 12, minWidth: 42, textAlign: "right" }}>
              {formatTime(currentTime)}
            </span>
            <div
              onClick={handleSeekClick}
              style={{
                flex: 1,
                height: 6,
                background: "#252540",
                borderRadius: 3,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#5b8def",
                  borderRadius: 3,
                  transition: "width 0.1s linear",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${progress}%`,
                  transform: "translate(-50%, -50%)",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#e2e2f0",
                  boxShadow: "0 0 6px rgba(0,0,0,0.5)",
                }}
              />
            </div>
            <span style={{ color: "#888", fontSize: 12, minWidth: 42 }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => onSetLoop(!loop)}
              style={{
                ...btnStyle,
                color: loop ? "#5b8def" : "#888",
                fontSize: 20,
              }}
              title="Loop"
            >
              {"\uD83D\uDD01"}
            </button>
            <button onClick={onPrev} style={btnStyle} title="Previous">
              {"\u23EE"}
            </button>
            <button
              onClick={() => onSeekRelative(-10)}
              style={{ ...btnStyle, fontSize: 14 }}
              title="-10s"
            >
              -10s
            </button>
            <button
              onClick={onTogglePlay}
              style={{
                ...btnStyle,
                fontSize: 30,
                width: 56,
                height: 56,
                borderRadius: 28,
                background: "#5b8def",
                color: "#fff",
                justifyContent: "center",
              }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "\u23F8" : "\u25B6"}
            </button>
            <button
              onClick={() => onSeekRelative(10)}
              style={{ ...btnStyle, fontSize: 14 }}
              title="+10s"
            >
              +10s
            </button>
            <button onClick={onNext} style={btnStyle} title="Next">
              {"\u23ED"}
            </button>
          </div>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#888", fontSize: 18 }}>{"\uD83D\uDD0A"}</span>
            <div
              onClick={handleVolumeClick}
              style={{
                width: 120,
                height: 5,
                background: "#252540",
                borderRadius: 3,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${volume}%`,
                  height: "100%",
                  background: "#5b8def",
                  borderRadius: 3,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${volume}%`,
                  transform: "translate(-50%, -50%)",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#e2e2f0",
                  boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom: Track list */}
        <div
          style={{
            flexShrink: 0,
            maxHeight: 180,
            overflowY: "auto",
            borderTop: "1px solid #2a2a40",
            padding: "8px 20px",
          }}
        >
          {tracks.map((track, i) => (
            <div
              key={i}
              onClick={() => onSelectTrack(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                background: i === currentTrackIndex ? "#1c1c32" : "transparent",
                color: i === currentTrackIndex ? "#5b8def" : "#e2e2f0",
                fontSize: 13,
              }}
            >
              <span style={{ minWidth: 22, textAlign: "right", color: "#555", fontSize: 12 }}>
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
              {i === currentTrackIndex && (
                <span style={{ fontSize: 11, color: "#5b8def" }}>
                  {isPlaying ? "\u25B6" : "\u23F8"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FullScreenPlayer;
