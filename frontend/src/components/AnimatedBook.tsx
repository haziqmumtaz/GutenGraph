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
        // Trigger animation after a short delay
        setTimeout(() => setShouldAnimate(true), 100);
      };

      const handleImageError = () => {
        console.warn("Failed to load image:", meta.imageUrl);
        // Still show the book even if image fails to load
        onImageLoaded?.();
        setTimeout(() => setShouldAnimate(true), 100);
      };

      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = meta.imageUrl;

      // Fallback timeout in case image never loads/errors
      const timeout = setTimeout(() => {
        handleImageError();
      }, 5000);

      return () => {
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
      };
    } else {
      // No image URL, show immediately
      onImageLoaded?.();
      setTimeout(() => setShouldAnimate(true), 100);
    }
  }, [meta.imageUrl, onImageLoaded]);

  const { title, author, description } = meta;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "600px",
        perspective: "1000px",
        position: "relative",
      }}
    >
      {/* Title appears above the book */}
      <div
        style={{
          opacity: shouldAnimate ? 1 : 0,
          transform: shouldAnimate ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease-out 0.5s",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        {title && (
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "rgba(255, 255, 255, 0.95)",
              textShadow: "0 4px 12px rgba(0,0,0,0.5)",
              margin: "0 0 0.5rem 0",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
        )}
        {author && (
          <p
            style={{
              fontSize: "1.3rem",
              color: "rgba(255, 255, 255, 0.8)",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            by {author}
          </p>
        )}
      </div>

      {/* Book container */}
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

          {/* Back of book (description) */}
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

        {/* Hover hint */}
        <div
          style={{
            position: "absolute",
            bottom: "-3rem",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: shouldAnimate && !isFlipped ? 0.7 : 0,
            transition: "opacity 0.3s ease",
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.9rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        >
          Hover to read description
        </div>
      </div>

      {/* Additional hint text */}
      <div
        style={{
          marginTop: "3rem",
          textAlign: "center",
          opacity: shouldAnimate ? 1 : 0,
          transition: "opacity 0.5s ease-out 1.5s",
        }}
      >
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.9rem",
            margin: 0,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          DIGITIZED and TRANSCRIBED for PROJECT GUTENBERG
        </p>
      </div>
    </div>
  );
}
