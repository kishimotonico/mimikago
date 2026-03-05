interface Props {
  onFolderSelected: (path: string) => void;
  onSelectFolder: () => void;
  selectedPath: string | null;
  scanning: boolean;
}

export function SetupScreen({
  onFolderSelected,
  onSelectFolder,
  selectedPath,
  scanning,
}: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#13132a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#e2e2f0",
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          mimikago
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>
          ローカル音声作品管理・再生アプリ
        </div>
      </div>

      <div
        style={{
          background: "#1c1c32",
          borderRadius: 12,
          padding: 32,
          width: 460,
          border: "1px solid #2a2a40",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#e2e2f0",
            marginBottom: 8,
          }}
        >
          はじめに
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 20, lineHeight: 1.7 }}>
          音声作品が保存されているルートフォルダーを選択してください。
          フォルダー内の作品を自動的にスキャンします。
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>
            ルートフォルダー
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "#252540",
                borderRadius: 6,
                border: "1px solid #3a3a55",
                fontSize: 12,
                color: selectedPath ? "#e2e2f0" : "#555",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedPath || "フォルダーを選択してください..."}
            </div>
            <button
              onClick={onSelectFolder}
              style={{
                padding: "8px 16px",
                background: "#5b8def",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              選択
            </button>
          </div>
        </div>

        {selectedPath && (
          <button
            onClick={() => onFolderSelected(selectedPath)}
            disabled={scanning}
            style={{
              width: "100%",
              padding: "10px 0",
              background: scanning ? "#3a3a55" : "#5b8def",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              fontSize: 13,
              cursor: scanning ? "default" : "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {scanning ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  ↻
                </span>
                スキャン中...
              </>
            ) : (
              "スキャンを開始"
            )}
          </button>
        )}
      </div>

      <div style={{ fontSize: 10, color: "#444" }}>mimikago v0.1.0</div>
    </div>
  );
}
