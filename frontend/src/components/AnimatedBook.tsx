import { useState, useEffect } from "react";
import type { BookMeta } from "../types/api";

interface AnimatedBookProps {
  meta: BookMeta;
  onImageLoaded?: () => void;
}

export function AnimatedBook({ meta, onImageLoaded }: AnimatedBookProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (meta.imageUrl) {
      const img = new Image();

      const handleImageLoad = () => {
        setImageLoaded(true);
        onImageLoaded?.();
        setTimeout(() => setShouldAnimate(true), 100);
      };

      const handleImageError = () => {
        console.warn("Failed to load image:", meta.imageUrl);
        onImageLoaded?.();
        setTimeout(() => setShouldAnimate(true), 100);
      };

      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = meta.imageUrl;

      const timeout = setTimeout(() => {
        handleImageError();
      }, 5000);

      return () => {
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
      };
    } else {
      onImageLoaded?.();
      setTimeout(() => setShouldAnimate(true), 100);
    }
  }, [meta.imageUrl, onImageLoaded]);

  const { title, description } = meta;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "400px",
        perspective: "1000px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          transform: shouldAnimate
            ? "translateY(0) scale(1) rotateY(0deg)"
            : "translateY(100vh) scale(0.3) rotateY(180deg)",
          transition: "all 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transformStyle: "preserve-3d",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          style={{
            position: "relative",
            width: "250px",
            height: "350px",
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s ease-in-out",
          }}
        >
          {/* Front of book (cover image) */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              border: "3px solid rgba(255,255,255,0.1)",
            }}
          >
            {meta.imageUrl && imageLoaded && (
              <img
                src={meta.imageUrl}
                alt={title || "Book cover"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            )}
          </div>

          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.95) 100%)",
              padding: "1.5rem",
              boxSizing: "border-box",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              border: "3px solid rgba(255,255,255,0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              overflow: "auto",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: "#2d3748",
                marginBottom: "1rem",
                textAlign: "center",
                borderBottom: "2px solid #e2e8f0",
                paddingBottom: "0.5rem",
              }}
            >
              Description
            </h3>
            <div
              style={{
                flex: 1,
                overflow: "auto",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  color: "#4a5568",
                  margin: 0,
                  textAlign: "justify",
                }}
              >
                {description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
