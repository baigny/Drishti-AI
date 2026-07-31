"use client";

import { TriangleAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="app" role="alert">
      <div style={{ margin: "auto", padding: 24, textAlign: "center" }}>
        <TriangleAlert size={40} color="var(--danger)" style={{ marginBottom: 12 }} />
        <h2>Something went wrong</h2>
        <p style={{ color: "var(--text-muted)", margin: "12px 0" }}>
          {error.message || "An unexpected error occurred."}
        </p>
        <button className="btn-main btn-start" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
