import { useState } from "react";
import { shortenUrl } from "../api/urlApi.js";

export default function ShortenForm({ onShortened }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setResult(null);
    setSubmitting(true);
    try {
      const data = await shortenUrl(url.trim());
      setResult(data);
      setUrl("");
      onShortened();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard() {
    if (result?.shortUrl) {
      navigator.clipboard.writeText(result.shortUrl).catch(() => {});
    }
  }

  return (
    <div style={styles.card}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a long URL here..."
          style={styles.input}
          disabled={submitting}
        />
        <button type="submit" style={styles.btn} disabled={submitting}>
          {submitting ? "..." : "Shorten"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.result}>
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            {result.shortUrl}
          </a>
          <button onClick={copyToClipboard} style={styles.copyBtn}>
            Copy
          </button>
          {!result.created && <span style={styles.dedup}>already existed</span>}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#f8f9fa",
    borderRadius: 12,
    padding: "1.25rem",
    marginBottom: "1.5rem",
  },
  form: { display: "flex", gap: 8 },
  input: {
    flex: 1,
    padding: "0.65rem 0.85rem",
    fontSize: "0.95rem",
    border: "1px solid #ddd",
    borderRadius: 8,
    outline: "none",
  },
  btn: {
    padding: "0.65rem 1.25rem",
    fontSize: "0.95rem",
    background: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  error: {
    color: "#c0392b",
    fontSize: "0.85rem",
    marginTop: 8,
    marginBottom: 0,
  },
  result: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  link: { fontWeight: 600, color: "#2980b9", wordBreak: "break-all" },
  copyBtn: {
    padding: "0.3rem 0.7rem",
    fontSize: "0.8rem",
    background: "#e8e8e8",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  dedup: { fontSize: "0.78rem", color: "#888" },
};
