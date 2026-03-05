import React, { useRef, useState, useCallback, useEffect } from "react";
import type { WorkSummary } from "../types";
import CoverImage from "./CoverImage";
import { formatDuration } from "../hooks/usePlayer";

interface LibraryTableProps {
  works: WorkSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenFull: (id: string) => void;
  playingWorkId?: string;
}

const HEADER_HEIGHT = 32;
const ROW_HEIGHT = 48;

const headerCellBase: React.CSSProperties = {
  color: "#888",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  padding: "0 8px",
  whiteSpace: "nowrap",
  userSelect: "none",
};

const cellBase: React.CSSProperties = {
  padding: "0 8px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const LibraryTable: React.FC<LibraryTableProps> = ({
  works,
  selectedId,
  onSelect,
  onOpenFull,
  playingWorkId,
}) => {
  return (
    <div style={{ padding: "0 20px 16px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: HEADER_HEIGHT,
          borderBottom: "1px solid #2a2a40",
          position: "sticky",
          top: 0,
          background: "#13132a",
          zIndex: 1,
        }}
      >
        <div style={{ ...headerCellBase, width: 48, flexShrink: 0 }} />
        <div style={{ ...headerCellBase, flex: 1, minWidth: 0 }}>Title</div>
        <div style={{ ...headerCellBase, width: 200, flexShrink: 0 }}>
          Tags
        </div>
        <div
          style={{
            ...headerCellBase,
            width: 50,
            flexShrink: 0,
            textAlign: "right",
          }}
        >
          Tracks
        </div>
        <div
          style={{
            ...headerCellBase,
            width: 60,
            flexShrink: 0,
            textAlign: "right",
          }}
        >
          Duration
        </div>
      </div>

      {/* Rows */}
      {works.map((work) => (
        <TableRow
          key={work.id}
          work={work}
          isSelected={selectedId === work.id}
          isPlaying={playingWorkId === work.id}
          onSelect={() => onSelect(work.id)}
          onOpenFull={() => onOpenFull(work.id)}
        />
      ))}
    </div>
  );
};

interface TableRowProps {
  work: WorkSummary;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onOpenFull: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
  work,
  isSelected,
  isPlaying,
  onSelect,
  onOpenFull,
}) => {
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
        onOpenFull();
      } else {
        clickTimer.current = setTimeout(() => {
          clickTimer.current = null;
          onSelect();
        }, 200);
      }
    },
    [onSelect, onOpenFull]
  );

  const hasError = work.status === "error" || !!work.errorMessage;
  const isMissing = work.status === "missing";

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: ROW_HEIGHT,
    cursor: "pointer",
    borderBottom: "1px solid #1c1c32",
    background: isSelected
      ? "rgba(91,141,239,0.1)"
      : hovered
        ? "rgba(255,255,255,0.03)"
        : "transparent",
    outline: isSelected ? "1px solid #5b8def" : "none",
    outlineOffset: -1,
    borderRadius: 4,
    userSelect: "none",
    opacity: isMissing ? 0.5 : 1,
  };

  const maxTags = 3;
  const visibleTags = work.tags.slice(0, maxTags);
  const extraCount = work.tags.length - maxTags;

  const tagStyle: React.CSSProperties = {
    display: "inline-block",
    background: "#252540",
    color: "#888",
    fontSize: 10,
    padding: "1px 6px",
    borderRadius: 3,
    marginRight: 4,
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={rowStyle}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div
        style={{
          width: 48,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CoverImage
          workId={work.id}
          coverImage={work.coverImage}
          physicalPath={work.physicalPath}
          size={36}
          hasError={hasError}
          isMissing={isMissing}
        />
      </div>

      {/* Title */}
      <div
        style={{
          ...cellBase,
          flex: 1,
          minWidth: 0,
          color: "#e2e2f0",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {isPlaying && (
          <span
            style={{
              color: "#5b8def",
              fontSize: 11,
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
            }}
            title="Now Playing"
          >
            &#9654;
          </span>
        )}
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={work.title}
        >
          {work.title}
        </span>
      </div>

      {/* Tags */}
      <div
        style={{
          ...cellBase,
          width: 200,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {visibleTags.map((tag) => (
          <span key={tag} style={tagStyle}>
            {tag}
          </span>
        ))}
        {extraCount > 0 && (
          <span style={{ ...tagStyle, color: "#555" }}>+{extraCount}</span>
        )}
      </div>

      {/* Track count */}
      <div
        style={{
          ...cellBase,
          width: 50,
          flexShrink: 0,
          textAlign: "right",
          color: "#888",
          fontSize: 12,
        }}
      >
        {work.trackCount}
      </div>

      {/* Duration */}
      <div
        style={{
          ...cellBase,
          width: 60,
          flexShrink: 0,
          textAlign: "right",
          color: "#888",
          fontSize: 12,
        }}
      >
        {formatDuration(work.totalDurationSec)}
      </div>
    </div>
  );
};

export default LibraryTable;
