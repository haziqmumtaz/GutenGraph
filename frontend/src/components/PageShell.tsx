import { type ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  title: string;
}

export function PageShell({ children, title }: PageShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        margin: "auto",
        width: "100%",
        padding: "2rem",
        alignItems: "center",
        justifyItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: "900",
          color: "rgba(255, 255, 255, 0.95)",
          textAlign: "center",
          marginBottom: "3rem",

          textShadow: "0 8px 32px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)",
          letterSpacing: "-2px",
          filter: "drop-shadow(0 0 20px rgba(255,255,255,0.1))",
        }}
      >
        {title}
      </h1>

      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
