import { useState } from "react";
import { PageShell } from "./components/PageShell";
import { InputRow } from "./components/InputRow";
import { ErrorBanner } from "./components/ErrorBanner";
import { LoadingBlock } from "./components/LoadingBlock";
import { AnimatedBook } from "./components/AnimatedBook";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { getBookMetaData } from "./api/books";
import { isValidBookId } from "./utils/validators";
import type { BookMeta } from "./types/api";

function App() {
  const [rawValue, setRawValue] = useState("");
  const [bookId, setBookId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<BookMeta | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const valid = isValidBookId(rawValue);

  const handleSubmit = async () => {
    if (!valid) {
      return; // Invalid input, do nothing
    }

    const id = Number(rawValue);
    setLoading(true);
    setImageLoading(false);
    setError(null);
    setMeta(null);
    setBookId(id);

    try {
      const bookMeta = await getBookMetaData(id);
      setMeta(bookMeta);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch book metadata";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleImageLoaded = () => {
    setImageLoading(false);
  };

  const showLoadingAnimation = loading || imageLoading;
  const showBook = meta && !showLoadingAnimation;

  // Debug logging
  console.log("App state:", {
    loading,
    imageLoading,
    showLoadingAnimation,
    showBook,
    hasMeta: !!meta,
  });

  return (
    <>
      <AnimatedBackground />
      <PageShell title="GutenGraph">
        {/* Input Section */}
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            marginBottom: "2rem",
          }}
        >
          <InputRow
            value={rawValue}
            onChange={setRawValue}
            onSubmit={handleSubmit}
            disabled={loading}
          />

          {rawValue && !valid && (
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                marginBottom: "0",
                textAlign: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Please enter a positive numeric ID.
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && <ErrorBanner message={error} />}

        {/* Loading Animation */}
        {showLoadingAnimation && (
          <LoadingBlock
            label={
              loading
                ? `Fetching metadata for ${bookId}…`
                : "Loading book cover..."
            }
          />
        )}

        {/* Book Display */}
        {showBook && (
          <AnimatedBook meta={meta} onImageLoaded={handleImageLoaded} />
        )}

        {/* Hint Text */}
        {!meta && !loading && (
          <div
            style={{
              marginTop: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.9rem",
                fontStyle: "italic",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                margin: 0,
              }}
            >
              Try Hamlet: <span style={{ fontWeight: "bold" }}>1524</span>,
              Romeo & Juliet: <span style={{ fontWeight: "bold" }}>1112</span>
            </p>
          </div>
        )}
      </PageShell>
    </>
  );
}

export default App;
