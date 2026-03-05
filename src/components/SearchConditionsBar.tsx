import React from "react";
import { SortId, SORT_OPTIONS } from "../types";

const FONT_FAMILY = "'Segoe UI', 'Noto Sans JP', sans-serif";

type SearchConditionsBarProps = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tagFilters: string[];
  setTagFilters: (tags: string[]) => void;
  sortId: SortId;
  setSortId: (id: SortId) => void;
  resultCount: number;
};

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(91,141,239,0.08)",
        border: "1px solid #2a2a40",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 12,
        color: "#e2e2f0",
        fontFamily: FONT_FAMILY,
        whiteSpace: "nowrap",
        transition: "border-color 0.15s",
        ...(hovered ? { borderColor: "#3a3a55" } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: "transparent",
          border: "none",
          color: "#888",
          cursor: "pointer",
          fontSize: 12,
          padding: 0,
          marginLeft: 2,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          transition: "color 0.15s",
          ...(hovered ? { color: "#e2e2f0" } : {}),
        }}
      >
        ✕
      </button>
    </span>
  );
}

const SearchConditionsBar: React.FC<SearchConditionsBarProps> = ({
  searchQuery,
  setSearchQuery,
  tagFilters,
  setTagFilters,
  sortId,
  setSortId,
  resultCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [sortBtnHovered, setSortBtnHovered] = React.useState(false);
  const [clearHovered, setClearHovered] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const hasConditions = searchQuery.trim() !== "" || tagFilters.length > 0;
  const currentSort = SORT_OPTIONS.find((o) => o.id === sortId);

  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleClearAll = () => {
    setSearchQuery("");
    setTagFilters([]);
  };

  const removeTag = (tag: string) => {
    setTagFilters(tagFilters.filter((t) => t !== tag));
  };

  return (
    <div
      style={{
        background: "#15152c",
        padding: "8px 20px",
        borderBottom: "1px solid #1e1e38",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: FONT_FAMILY,
        minHeight: 36,
        gap: 16,
      }}
    >
      {/* Left: Active search chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          flex: 1,
          minWidth: 0,
        }}
      >
        {hasConditions ? (
          <>
            {searchQuery.trim() !== "" && (
              <Chip
                label={`検索: ${searchQuery}`}
                onRemove={() => setSearchQuery("")}
              />
            )}
            {tagFilters.map((tag) => (
              <Chip key={tag} label={tag} onRemove={() => removeTag(tag)} />
            ))}
            <button
              type="button"
              onClick={handleClearAll}
              onMouseEnter={() => setClearHovered(true)}
              onMouseLeave={() => setClearHovered(false)}
              style={{
                background: "transparent",
                border: "none",
                color: clearHovered ? "#5b8def" : "#888",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                padding: "2px 4px",
                transition: "color 0.15s",
              }}
            >
              すべてクリア
            </button>
          </>
        ) : (
          <span style={{ fontSize: 12, color: "#555" }}>
            フィルターなし
          </span>
        )}
      </div>

      {/* Right: Result count + Sort dropdown */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#888",
            whiteSpace: "nowrap",
          }}
        >
          {resultCount} 作品
        </span>

        {/* Sort dropdown */}
        <div
          ref={dropdownRef}
          style={{ position: "relative", userSelect: "none" }}
        >
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            onMouseEnter={() => setSortBtnHovered(true)}
            onMouseLeave={() => setSortBtnHovered(false)}
            style={{
              background: sortBtnHovered ? "#252540" : "transparent",
              border: "1px solid #2a2a40",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              color: "#e2e2f0",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              whiteSpace: "nowrap",
              transition: "background 0.15s, border-color 0.15s",
              ...(sortBtnHovered ? { borderColor: "#3a3a55" } : {}),
              ...(dropdownOpen
                ? {
                    background: "rgba(91,141,239,0.08)",
                    borderColor: "#5b8def",
                  }
                : {}),
            }}
          >
            並び替え: {currentSort?.label ?? sortId}{" "}
            <span style={{ fontSize: 10, marginLeft: 2 }}>▼</span>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                background: "#1c1c32",
                border: "1px solid #2a2a40",
                borderRadius: 6,
                padding: "4px 0",
                minWidth: 200,
                zIndex: 1100,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <SortMenuItem
                  key={opt.id}
                  label={opt.label}
                  active={opt.id === sortId}
                  onClick={() => {
                    setSortId(opt.id);
                    setDropdownOpen(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function SortMenuItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: hovered
          ? "rgba(91,141,239,0.08)"
          : active
            ? "rgba(91,141,239,0.04)"
            : "transparent",
        border: "none",
        padding: "7px 14px",
        fontSize: 12,
        color: active ? "#5b8def" : "#e2e2f0",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        fontFamily: FONT_FAMILY,
        transition: "background 0.12s",
      }}
    >
      {label}
    </button>
  );
}

export default SearchConditionsBar;
