import type { BookMeta } from "../types/api";

interface BookCardProps {
  meta: BookMeta;
}

export function BookCard({ meta }: BookCardProps) {
  // Extract known fields and any additional fields
  const { title, author, imageUrl, description, ...extraFields } = meta;

  // Filter out raw/fulltext fields and any null/undefined values
  const displayFields = Object.entries(extraFields).filter(
    ([key, value]) =>
      !["raw", "fulltext", "imageurl", "description"].includes(
        key.toLowerCase()
      ) &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1.5rem",
        margin: "1rem 0",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
        {imageUrl && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={imageUrl}
              alt={title ? `Cover of ${title}` : "Book cover"}
              style={{
                width: "120px",
                height: "auto",
                maxHeight: "180px",
                borderRadius: "4px",
                objectFit: "cover",
                border: "1px solid #e5e7eb",
              }}
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <div style={{ flex: 1 }}>
          {title && (
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "#111827",
              }}
            >
              {title}
            </h2>
          )}

          {author && (
            <p
              style={{
                fontSize: "1rem",
                color: "#6b7280",
                marginBottom: "1rem",
              }}
            >
              by {author}
            </p>
          )}

          {displayFields.length > 0 && (
            <dl style={{ margin: 0 }}>
              {displayFields.map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    marginBottom: "0.5rem",
                    gap: "1rem",
                  }}
                >
                  <dt
                    style={{
                      fontWeight: "600",
                      color: "#374151",
                      minWidth: "100px",
                      textTransform: "capitalize",
                    }}
                  >
                    {key.replace(/[_-]/g, " ")}:
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      color: "#6b7280",
                    }}
                  >
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
