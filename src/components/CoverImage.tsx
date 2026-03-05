import React from "react";

interface CoverImageProps {
  workId: string;
  coverImage: string | null;
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

const CoverImage: React.FC<CoverImageProps> = ({
  workId,
  coverImage,
  size,
  hasError,
  bookmarked,
  style,
}) => {
  const hue = hashHue(workId);

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

  const noImageTextStyle: React.CSSProperties = {
    color: "#555",
    fontSize: Math.max(10, size * 0.08),
    userSelect: "none",
  };

  const errorBadgeStyle: React.CSSProperties = {
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
  };

  const bookmarkStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 6,
    width: Math.max(12, size * 0.1),
    color: "#5b8def",
    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
  };

  return (
    <div style={containerStyle}>
      {coverImage ? (
        <img
          src={`asset://localhost/${encodeURIComponent(coverImage)}`}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          draggable={false}
        />
      ) : (
        <div style={placeholderStyle}>
          <span style={noImageTextStyle}>No Image</span>
        </div>
      )}

      {hasError && <div style={errorBadgeStyle}>!</div>}

      {bookmarked && (
        <svg
          style={bookmarkStyle}
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
