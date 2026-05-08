import { useState } from "react";
import { shortenUrl } from "../api/urlApi.js";

export default function ShortenForm({ onShortened }) {
  const [url, setUrl] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
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
      const data = await shortenUrl(url.trim(), expiresIn || null);
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
    <div className="form-card">
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a long URL here..."
          className="form-input"
          disabled={submitting}
        />
        <select
          value={expiresIn}
          onChange={(e) => setExpiresIn(e.target.value)}
          className="form-expiry"
        >
          <option value="">No expiry</option>
          <option value="3600">1 hour</option>
          <option value="86400">24 hours</option>
          <option value="604800">7 days</option>
          <option value="2592000">30 days</option>
        </select>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "..." : "Shorten"}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {result && (
        <div className="form-result">
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="form-result-link"
          >
            {result.shortUrl}
          </a>
          <button onClick={copyToClipboard} className="btn-secondary">
            Copy
          </button>
          {!result.created && (
            <span className="dedup-label">already existed</span>
          )}
        </div>
      )}
    </div>
  );
}
