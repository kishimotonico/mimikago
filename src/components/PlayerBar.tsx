import React, { useCallback } from "react";
import type { Track, WorkSummary, Work } from "../types";
import CoverImage from "./CoverImage";
import { formatTime } from "../hooks/usePlayer";

interface PlayerBarProps {
  currentTrack: Track | null;
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
  onExpand: () => void;
}

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#e2e2f0",
  cursor: "pointer",
  fontSize: 18,
  padding: "4px 6px",
  lineHeight: 1,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const btnDisabledStyle: React.CSSProperties = {
  ...btnStyle,
  color: "#555",
  cursor: "default",
};

const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
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
  onExpand,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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

  const hasTrack = currentTrack !== null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: "#141426",
        borderTop: "1px solid #2a2a40",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
      }}
    >
      {/* Left: cover + info + expand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 200,
          maxWidth: 280,
          flex: "0 0 auto",
        }}
      >
        {currentWork ? (
          <CoverImage
            workId={currentWork.id}
            coverImage={currentWork.coverImage}
            physicalPath={currentWork?.physicalPath}
            size={48}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 6,
              background: "#1c1c32",
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              color: "#e2e2f0",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentTrack?.title || "\u00A0"}
          </div>
          <div
            style={{
              color: "#888",
              fontSize: 11,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentWork?.title || "\u00A0"}
          </div>
        </div>
        <button
          onClick={onExpand}
          style={{
            ...btnStyle,
            fontSize: 16,
            opacity: hasTrack ? 1 : 0.3,
          }}
          disabled={!hasTrack}
          title="Expand"
        >
          {"\u25B2"}
        </button>
      </div>

      {/* Center: controls + seek bar */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          minWidth: 0,
        }}
      >
        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => onSetLoop(!loop)}
            style={{
              ...btnStyle,
              color: loop ? "#5b8def" : "#888",
              fontSize: 16,
            }}
            title="Loop"
          >
            {"\uD83D\uDD01"}
          </button>
          <button
            onClick={onPrev}
            style={hasTrack ? btnStyle : btnDisabledStyle}
            disabled={!hasTrack}
            title="Previous"
          >
            {"\u23EE"}
          </button>
          <button
            onClick={() => onSeekRelative(-10)}
            style={hasTrack ? { ...btnStyle, fontSize: 12 } : { ...btnDisabledStyle, fontSize: 12 }}
            disabled={!hasTrack}
            title="-10s"
          >
            -10s
          </button>
          <button
            onClick={onTogglePlay}
            style={{
              ...btnStyle,
              fontSize: 24,
              width: 40,
              height: 40,
              borderRadius: 20,
              background: hasTrack ? "#5b8def" : "#252540",
              color: hasTrack ? "#fff" : "#555",
              justifyContent: "center",
            }}
            disabled={!hasTrack}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "\u23F8" : "\u25B6"}
          </button>
          <button
            onClick={() => onSeekRelative(10)}
            style={hasTrack ? { ...btnStyle, fontSize: 12 } : { ...btnDisabledStyle, fontSize: 12 }}
            disabled={!hasTrack}
            title="+10s"
          >
            +10s
          </button>
          <button
            onClick={onNext}
            style={hasTrack ? btnStyle : btnDisabledStyle}
            disabled={!hasTrack}
            title="Next"
          >
            {"\u23ED"}
          </button>
        </div>

        {/* Seek bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            maxWidth: 680,
          }}
        >
          <span style={{ color: "#888", fontSize: 11, minWidth: 38, textAlign: "right" }}>
            {formatTime(currentTime)}
          </span>
          <div
            onClick={handleSeekClick}
            style={{
              flex: 1,
              height: 6,
              background: "#252540",
              borderRadius: 3,
              cursor: hasTrack ? "pointer" : "default",
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
            {hasTrack && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${progress}%`,
                  transform: "translate(-50%, -50%)",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#e2e2f0",
                  boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                }}
              />
            )}
          </div>
          <span style={{ color: "#888", fontSize: 11, minWidth: 38 }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: volume */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minWidth: 140,
          flex: "0 0 auto",
          justifyContent: "flex-end",
        }}
      >
        <span style={{ color: "#888", fontSize: 16 }}>{"\uD83D\uDD0A"}</span>
        <div
          onClick={handleVolumeClick}
          style={{
            width: 90,
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
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#e2e2f0",
              boxShadow: "0 0 4px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
