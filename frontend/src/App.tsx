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
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
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
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze book";
      setError(errorMessage);
      setErrorDescription(err?.response?.data?.message);
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
      <PageShell>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            width: "100%",
            margin: "auto",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              flex: 1,
              maxWidth: "45%",
              transform: showBook ? "translateX(0)" : "translateX(60%)",
            }}
          >
            <h1
              style={{
                fontSize: "4rem",
                fontWeight: "900",
                color: "rgba(255, 255, 255, 0.95)",
                textAlign: "center",
                marginBottom: "3rem",

                textShadow:
                  "0 8px 32px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)",
                letterSpacing: "-2px",
                filter: "drop-shadow(0 0 20px rgba(255,255,255,0.1))",
              }}
            >
              GutenGraph
            </h1>
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

            {error && (
              <ErrorBanner
                message={error}
                description={errorDescription || undefined}
              />
            )}

            {showLoadingAnimation && (
              <LoadingSpinner
                label={
                  loading
                    ? `Fetching metadata for ${bookId}…`
                    : "Loading book cover..."
                }
              />
            )}

            {/* Book Title and Author Display */}
            {showBook && (
              <div
                style={{
                  opacity: showBook ? 1 : 0,
                  transform: showBook ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  marginBottom: "2rem",
                  textAlign: "center",
                }}
              >
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
                  {meta.title}
                </h1>
                <p
                  style={{
                    fontSize: "1.3rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  by {meta.author}
                </p>
              </div>
            )}

            {showBook && (
              <div
                style={{
                  opacity: showBook ? 1 : 0,
                  transform: showBook ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <AnimatedBook meta={meta} onImageLoaded={handleImageLoaded} />
              </div>
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
                  Romeo & Juliet:{" "}
                  <span style={{ fontWeight: "bold" }}>1112</span>
                </p>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              margin: "auto",
              justifyContent: "flex-start",
              maxWidth: "45%",
              opacity: showBook ? 1 : 0,
              transform: showBook ? "translateX(0)" : "translateX(50px)",
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              visibility: showBook ? "visible" : "hidden",
            }}
          >
            {showBook && (
              <>
                <div
                  style={{
                    marginBottom: "1rem",
                    textAlign: "center",
                    // display:
                    //   !analysisResult || !analysisResult.graph
                    //     ? "block"
                    //     : "none",
                  }}
                >
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
                  <div style={{ width: "100%", height: "500px" }}>
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
          </div>
        </div>
      </PageShell>
    </>
  );
}

export default App;
