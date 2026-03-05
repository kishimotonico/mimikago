import React, { useState } from "react";

interface CoverImageProps {
  workId: string;
  coverImage: string | null;
  physicalPath?: string;
  size: number;
  hasError?: boolean;
  bookmarked?: boolean;
  style?: React.CSSProperties;
}

function hashHue(workId: string): number {
  let hash = 0;
  for (let i = 0; i < workId.length; i++) {
    hash = (hash + workId.charCodeAt(i) * (i + 1)) % 360;
  }
  return hash;
}

function buildAssetUrl(physicalPath: string, coverImage: string): string {
  const fullPath = `${physicalPath}/${coverImage}`;
  return `asset://localhost/${fullPath.split("/").map(encodeURIComponent).join("/")}`;
}

const CoverImage: React.FC<CoverImageProps> = ({
  workId,
  coverImage,
  physicalPath,
  size,
  hasError,
  bookmarked,
  style,
}) => {
  const hue = hashHue(workId);
  const [imgError, setImgError] = useState(false);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: size,
    height: size,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
    ...style,
  };

  const placeholderStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background: `linear-gradient(135deg, hsl(${hue}, 40%, 25%), hsl(${(hue + 60) % 360}, 40%, 18%))`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const showImage = coverImage && physicalPath && !imgError && window.__TAURI__;
  const imgSrc = showImage ? buildAssetUrl(physicalPath, coverImage) : "";

  return (
    <div style={containerStyle}>
      {showImage ? (
        <img
          src={imgSrc}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          draggable={false}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={placeholderStyle}>
          <span
            style={{
              color: "#555",
              fontSize: Math.max(10, size * 0.08),
              userSelect: "none",
            }}
          >
            No Image
          </span>
        </div>
      )}

      {hasError && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: Math.max(14, size * 0.12),
            height: Math.max(14, size * 0.12),
            borderRadius: "50%",
            background: "#e53e3e",
            color: "#fff",
            fontSize: Math.max(9, size * 0.07),
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        >
          !
        </div>
      )}

      {bookmarked && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 6,
            width: Math.max(12, size * 0.1),
            color: "#5b8def",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
          }}
          viewBox="0 0 12 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 0h10a1 1 0 011 1v14.5a.5.5 0 01-.8.4L6 12l-5.2 3.9A.5.5 0 010 15.5V1a1 1 0 011-1z" />
        </svg>
      )}
    </div>
  );
};

export default CoverImage;
