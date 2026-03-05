import React from "react";
import type { UrlEntry } from "../types";

interface UrlButtonsProps {
  urls: UrlEntry[];
  compact?: boolean;
}

const UrlButtons: React.FC<UrlButtonsProps> = ({ urls, compact }) => {
  if (urls.length === 0) return null;

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: compact ? 3 : 4,
    padding: compact ? "2px 6px" : "3px 8px",
    fontSize: compact ? 11 : 12,
    color: "#5b8def",
    background: "rgba(91,141,239,0.08)",
    border: "1px solid rgba(91,141,239,0.2)",
    borderRadius: 4,
    cursor: "pointer",
    whiteSpace: "nowrap",
    lineHeight: 1.3,
    transition: "background 0.15s",
  };

  const handleClick = (url: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 4 : 6 }}>
      {urls.map((entry, i) => (
        <button
          key={i}
          style={buttonStyle}
          onClick={handleClick(entry.url)}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(91,141,239,0.16)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(91,141,239,0.08)";
          }}
          title={entry.url}
        >
          {entry.label}
          <span style={{ fontSize: compact ? 9 : 10 }}>&#x2197;</span>
        </button>
      ))}
    </div>
  );
};

export default UrlButtons;
