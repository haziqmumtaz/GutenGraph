import { useState } from "react";
import { PageShell } from "./components/PageShell";
import { InputRow } from "./components/InputRow";
import { ErrorBanner } from "./components/ErrorBanner";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AnimatedBook } from "./components/AnimatedBook";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { CharacterGraph } from "./components/CharacterGraph";
import { getBookMetaData, analyzeBook } from "./api/books";
import { isValidBookId } from "./utils/validators";
import type { BookMeta, AnalysisResult } from "./types/api";

function App() {
  const [rawValue, setRawValue] = useState("");
  const [bookId, setBookId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<BookMeta | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  const valid = isValidBookId(rawValue);

  const handleSubmit = async () => {
    if (!valid) {
      return;
    }

    const id = Number(rawValue);
    setLoading(true);
    setError(null);
    setMeta(null);
    setAnalysisResult(null);
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

  const handleAnalyze = async () => {
    if (!bookId) return;

    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeBook(bookId);
      setAnalysisResult(result);
      setAnalyzing(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze book";
      setError(errorMessage);
      setAnalyzing(false);
    }
  };

  const handleImageLoaded = () => {
    setImageLoading(false);
  };

  const showLoadingAnimation = loading || imageLoading;
  const showBook = meta && !showLoadingAnimation;

  return (
    <>
      <AnimatedBackground />
      <PageShell title="GutenGraph">
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

        {error && <ErrorBanner message={error} />}

        {showLoadingAnimation && (
          <LoadingSpinner
            label={
              loading
                ? `Fetching metadata for ${bookId}…`
                : "Loading book cover..."
            }
          />
        )}

        {showBook && (
          <>
            <AnimatedBook meta={meta} onImageLoaded={handleImageLoaded} />
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              {analyzing ? (
                <LoadingSpinner label="Analyzing character interactions..." />
              ) : (
                <button
                  onClick={handleAnalyze}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "8px",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  Analyze Interactions
                </button>
              )}
            </div>
            {analysisResult && analysisResult.graph && (
              <div style={{ marginTop: "2rem" }}>
                <h3
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    margin: "0 0 1rem 0",
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Character Interaction Network
                </h3>
                <CharacterGraph graphData={analysisResult.graph} />
              </div>
            )}
          </>
        )}

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
