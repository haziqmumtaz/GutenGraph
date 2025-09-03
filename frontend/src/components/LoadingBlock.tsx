interface LoadingBlockProps {
  label?: string;
}

export function LoadingBlock({ label = "Loading…" }: LoadingBlockProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        margin: "2rem 0",
        textAlign: "center",
      }}
    >
      {/* Animated Book Icon */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            width: "80px",
            height: "60px",
            position: "relative",
            perspective: "200px",
          }}
        >
          {/* Book Cover */}
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "6px",
              position: "absolute",
              transformOrigin: "left center",
              animation:
                "bookFlip 2s ease-in-out infinite, bookGlow 3s ease-in-out infinite",
              border: "2px solid rgba(255,255,255,0.6)",
            }}
          />
          {/* Book Pages */}
          <div
            style={{
              width: "76px",
              height: "56px",
              backgroundColor: "rgba(240, 240, 245, 0.9)",
              borderRadius: "4px",
              position: "absolute",
              top: "2px",
              left: "2px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>

      <p
        style={{
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: "1.1rem",
          fontWeight: "500",
          margin: 0,
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        {label}
      </p>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes bookFlip {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          25% {
            transform: rotateY(-20deg) scale(1.05);
          }
          50% {
            transform: rotateY(-35deg) scale(1.1);
          }
          75% {
            transform: rotateY(-20deg) scale(1.05);
          }
          100% {
            transform: rotateY(0deg) scale(1);
          }
        }
        
        @keyframes bookGlow {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          50% {
            box-shadow: 0 4px 20px rgba(255,255,255,0.3);
          }
        }
      `}</style>
    </div>
  );
}
