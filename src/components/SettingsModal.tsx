import React, { useEffect } from "react";

interface SettingsModalProps {
  rootFolder: string | null;
  lastScanTime: string | null;
  scanning: boolean;
  onClose: () => void;
  onScan: () => void;
  onChangeFolder: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  rootFolder,
  lastScanTime,
  scanning,
  onClose,
  onScan,
  onChangeFolder,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.55)",
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1e1e34",
          borderRadius: 10,
          padding: 22,
          width: 420,
          maxWidth: "90vw",
          color: "#e2e2f0",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {"\u8A2D\u5B9A"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#888",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            {"\u2715"}
          </button>
        </div>

        {/* Root folder */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>
            {"\u30EB\u30FC\u30C8\u30D5\u30A9\u30EB\u30C0"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#252540",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: rootFolder ? "#e2e2f0" : "#555",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {rootFolder || "\u672A\u8A2D\u5B9A"}
            </div>
            <button
              onClick={onChangeFolder}
              style={{
                background: "#252540",
                border: "1px solid #3a3a55",
                borderRadius: 6,
                color: "#e2e2f0",
                cursor: "pointer",
                padding: "8px 14px",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              {"\u5909\u66F4"}
            </button>
          </div>
        </div>

        {/* Scan */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>
            {"\u30B9\u30AD\u30E3\u30F3"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              onClick={onScan}
              disabled={scanning}
              style={{
                background: scanning ? "#252540" : "#5b8def",
                border: "none",
                borderRadius: 6,
                color: scanning ? "#888" : "#fff",
                cursor: scanning ? "default" : "pointer",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {scanning && (
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid #555",
                    borderTopColor: "#e2e2f0",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              )}
              {"\u30D5\u30EB\u30B9\u30AD\u30E3\u30F3\u5B9F\u884C"}
            </button>
            {lastScanTime && (
              <span style={{ color: "#555", fontSize: 12 }}>
                {"\u524D\u56DE: "}{lastScanTime}
              </span>
            )}
          </div>
        </div>

        {/* Version */}
        <div
          style={{
            borderTop: "1px solid #2a2a40",
            paddingTop: 14,
            color: "#555",
            fontSize: 12,
          }}
        >
          mimikago v0.1.0 (Phase 1)
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SettingsModal;
