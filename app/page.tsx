"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [views, setViews] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createPaste() {
    setError(null);
    setResult(null);

    const payload: any = { content };

    if (ttl) payload.ttl_seconds = Number(ttl);
    if (views) payload.max_views = Number(views);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data: any;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // Handle non-JSON response (e.g. 500 HTML error page)
        setError(`Server error (${res.status}): Please try again later.`);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to create paste");
        return;
      }

      setResult(data.url);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error: Please check your connection.");
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Pastebin Lite</h1>

      <textarea
        rows={8}
        style={{ width: "100%" }}
        placeholder="Paste content here..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div style={{ marginTop: 10 }}>
        <input
          placeholder="TTL seconds (optional)"
          value={ttl}
          onChange={e => setTtl(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          placeholder="Max views (optional)"
          value={views}
          onChange={e => setViews(e.target.value)}
        />
      </div>

      <button style={{ marginTop: 15 }} onClick={createPaste}>
        Create Paste
      </button>

      {result && (
        <p>
          Created: <a href={result}>{result}</a>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
