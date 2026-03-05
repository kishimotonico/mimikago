import React from "react";
import type { WorkSummary } from "../types";
import WorkCard from "./WorkCard";

interface LibraryGridProps {
  works: WorkSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenFull: (id: string) => void;
  coverSize: number;
}

const LibraryGrid: React.FC<LibraryGridProps> = ({
  works,
  selectedId,
  onSelect,
  onOpenFull,
  coverSize,
}) => {
  const gap = coverSize < 140 ? 14 : 18;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap,
    padding: "16px 20px",
    alignContent: "flex-start",
  };

  return (
    <div style={containerStyle}>
      {works.map((work) => (
        <WorkCard
          key={work.id}
          work={work}
          onClick={() => onSelect(work.id)}
          onDoubleClick={() => onOpenFull(work.id)}
          isSelected={selectedId === work.id}
          coverSize={coverSize}
        />
      ))}
    </div>
  );
};

export default LibraryGrid;
