import React from "react";

interface NewWorkPopupProps {
  newWorkIds: string[];
  onClose: () => void;
}

const NewWorkPopup: React.FC<NewWorkPopupProps> = ({ newWorkIds, onClose }) => {
  if (newWorkIds.length === 0) return null;

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
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>{"\u2728"}</div>
        <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700 }}>
          {"\u65B0\u3057\u3044\u4F5C\u54C1\u304C\u898B\u3064\u304B\u308A\u307E\u3057\u305F"}
        </h2>
        <p style={{ color: "#888", fontSize: 14, margin: "0 0 20px" }}>
          {newWorkIds.length} {"\u4EF6\u306E\u65B0\u3057\u3044\u4F5C\u54C1\u304C\u691C\u51FA\u3055\u308C\u307E\u3057\u305F\u3002"}
        </p>
        <button
          onClick={onClose}
          style={{
            background: "#5b8def",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            cursor: "pointer",
            padding: "10px 28px",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default NewWorkPopup;
