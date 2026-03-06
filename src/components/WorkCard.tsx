import React, { useRef, useState, useCallback, useEffect } from "react";
import type { WorkSummary } from "../types";
import CoverImage from "./CoverImage";
import { formatDuration } from "../hooks/usePlayer";

interface WorkCardProps {
  work: WorkSummary;
  onClick: () => void;
  onDoubleClick: () => void;
  isSelected: boolean;
  coverSize: number;
}

const WorkCard: React.FC<WorkCardProps> = ({
  work,
  onClick,
  onDoubleClick,
  isSelected,
  coverSize,
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
        onDoubleClick();
      } else {
        clickTimer.current = setTimeout(() => {
          clickTimer.current = null;
          onClick();
        }, 200);
      }
    },
    [onClick, onDoubleClick]
  );

  const cardWidth = coverSize + 16;

  const cardStyle: React.CSSProperties = {
    width: cardWidth,
    padding: 8,
    borderRadius: 8,
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
    transform: hovered ? "translateY(-2px)" : "none",
    outline: isSelected
      ? "2px solid #5b8def"
      : hovered
        ? "1px solid #5b8def"
        : "1px solid transparent",
    outlineOffset: -1,
    background: isSelected ? "rgba(91,141,239,0.08)" : "transparent",
    userSelect: "none",
  };

  const titleStyle: React.CSSProperties = {
    color: "#e2e2f0",
    fontSize: 13,
    fontWeight: 500,
    marginTop: 6,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.3",
  };

  const metaStyle: React.CSSProperties = {
    color: "#888",
    fontSize: 11,
    marginTop: 2,
  };

  const hasError = work.status === "error" || !!work.errorMessage;
  const isMissing = work.status === "missing";

  return (
    <div
      style={{ ...cardStyle, opacity: isMissing ? 0.5 : 1 }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CoverImage
        workId={work.id}
        coverImage={work.coverImage}
        physicalPath={work.physicalPath}
        size={coverSize}
        hasError={hasError}
        isMissing={isMissing}
        bookmarked={work.bookmarked}
      />
      <div style={titleStyle} title={work.title}>
        {work.title}
      </div>
      <div style={metaStyle}>
        {isMissing ? "行方不明" : `${work.trackCount} tracks \u00B7 ${formatDuration(work.totalDurationSec)}`}
      </div>
    </div>
  );
};

export default WorkCard;
