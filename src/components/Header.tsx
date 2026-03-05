import React from "react";
import { ViewMode, GRID_SIZE_KEYS } from "../types";

const FONT_FAMILY = "'Segoe UI', 'Noto Sans JP', sans-serif";

type HeaderProps = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  onSettingsClick: () => void;
  gridSizeIdx: number;
  setGridSizeIdx: (idx: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  scanning?: boolean;
};

const iconBtnBase: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #2a2a40",
  color: "#e2e2f0",
  borderRadius: 6,
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 15,
  fontFamily: FONT_FAMILY,
  transition: "background 0.15s, border-color 0.15s",
};

const iconBtnActiveBase: React.CSSProperties = {
  ...iconBtnBase,
  background: "rgba(91,141,239,0.08)",
  borderColor: "#5b8def",
  color: "#5b8def",
};

function IconButton({
  active,
  style,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  style?: React.CSSProperties;
  title?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = React.useState(false);
  const base = active ? iconBtnActiveBase : iconBtnBase;
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        ...(hovered && !active
          ? { background: "#252540", borderColor: "#3a3a55" }
          : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function SmallButton({
  disabled,
  onClick,
  children,
  style,
}: {
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "transparent",
        border: "1px solid #2a2a40",
        color: disabled ? "#555" : "#e2e2f0",
        borderRadius: 4,
        width: 24,
        height: 24,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        fontSize: 14,
        fontFamily: FONT_FAMILY,
        transition: "background 0.15s, border-color 0.15s",
        ...(hovered && !disabled
          ? { background: "#252540", borderColor: "#3a3a55" }
          : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onRefresh,
  onSettingsClick,
  gridSizeIdx,
  setGridSizeIdx,
  viewMode,
  setViewMode,
  scanning,
}) => {
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [localQuery, setLocalQuery] = React.useState(searchQuery);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external changes to local
  React.useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setLocalQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchQuery(value);
      }, 200);
    },
    [setSearchQuery]
  );

  const canDecrement = gridSizeIdx > 0;
  const canIncrement = gridSizeIdx < GRID_SIZE_KEYS.length - 1;

  return (
    <header
      style={{
        height: 52,
        flexShrink: 0,
        background: "#1a1a2e",
        borderBottom: "1px solid #2a2a40",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        fontFamily: FONT_FAMILY,
        gap: 12,
      }}
    >
      {/* Left: App title */}
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: "#e2e2f0",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        mimikago
      </div>

      {/* Center: Search input */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          minWidth: 0,
        }}
      >
        <input
          type="text"
          value={localQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="作品名・タグで検索..."
          style={{
            width: "100%",
            maxWidth: 420,
            height: 32,
            background: "#252540",
            border: `1px solid ${searchFocused ? "#5b8def" : "#3a3a55"}`,
            borderRadius: 6,
            padding: "0 12px",
            fontSize: 13,
            color: "#e2e2f0",
            fontFamily: FONT_FAMILY,
            outline: "none",
            transition: "border-color 0.15s",
          }}
        />
      </div>

      {/* Right controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {/* View mode toggle */}
        <IconButton
          active={viewMode === "grid"}
          title="グリッド表示"
          onClick={() => setViewMode("grid")}
        >
          ▦
        </IconButton>
        <IconButton
          active={viewMode === "table"}
          title="テーブル表示"
          onClick={() => setViewMode("table")}
        >
          ☰
        </IconButton>

        {/* Grid size control - only in grid mode */}
        {viewMode === "grid" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginLeft: 4,
              borderLeft: "1px solid #2a2a40",
              paddingLeft: 10,
            }}
          >
            <SmallButton
              disabled={!canDecrement}
              onClick={() => canDecrement && setGridSizeIdx(gridSizeIdx - 1)}
            >
              -
            </SmallButton>
            <span
              style={{
                fontSize: 12,
                color: "#888",
                minWidth: 24,
                textAlign: "center",
                userSelect: "none",
                fontFamily: FONT_FAMILY,
              }}
            >
              {GRID_SIZE_KEYS[gridSizeIdx]}
            </span>
            <SmallButton
              disabled={!canIncrement}
              onClick={() => canIncrement && setGridSizeIdx(gridSizeIdx + 1)}
            >
              +
            </SmallButton>
          </div>
        )}

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "#2a2a40",
            marginLeft: 4,
            marginRight: 4,
          }}
        />

        {/* Refresh */}
        <IconButton title="更新" onClick={onRefresh}>
          <span style={scanning ? { animation: "spin 1s linear infinite", display: "inline-block" } : undefined}>↻</span>
        </IconButton>

        {/* Settings */}
        <IconButton title="設定" onClick={onSettingsClick}>
          ⚙
        </IconButton>
      </div>
    </header>
  );
};

export default Header;
