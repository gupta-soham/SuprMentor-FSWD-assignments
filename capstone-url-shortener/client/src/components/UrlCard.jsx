import { useState } from "react";
import { deleteUrl } from "../api/urlApi.js";
import QRModal from "./QRModal.jsx";

function getExpiryInfo(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return { text: "Expired", expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return { text: `${days}d left`, expired: false };
  if (hours > 0) return { text: `${hours}h left`, expired: false };
  const mins = Math.floor(diff / 60000);
  return { text: `${mins}m left`, expired: false };
}

export default function UrlCard({ url, index, onDeleted, onViewStats }) {
  const [showQR, setShowQR] = useState(false);

  async function handleDelete() {
    try {
      await deleteUrl(url.shortCode);
      onDeleted();
    } catch {
      /* ignore */
    }
  }

  function copy() {
    navigator.clipboard.writeText(url.shortUrl).catch(() => {});
  }

  const expiry = getExpiryInfo(url.expiresAt);

  return (
    <li className="url-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="url-card__top">
        <a
          href={url.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="url-card__short"
        >
          {url.shortUrl}
        </a>
        <div className="url-card__meta">
          {expiry && (
            <span
              className={`expiry-badge${expiry.expired ? " expiry-badge--expired" : ""}`}
            >
              {expiry.text}
            </span>
          )}
          <span className="url-card__clicks">{url.clicks} clicks</span>
        </div>
      </div>
      <p className="url-card__long">
        {url.longUrl.length > 80
          ? url.longUrl.slice(0, 77) + "..."
          : url.longUrl}
      </p>
      <div className="url-card__actions">
        <button onClick={copy} className="btn-secondary">
          Copy
        </button>
        <button onClick={() => setShowQR(true)} className="btn-secondary">
          QR
        </button>
        <button
          onClick={() => onViewStats(url.shortCode)}
          className="btn-secondary"
        >
          Stats
        </button>
        <button onClick={handleDelete} className="btn-danger">
          Delete
        </button>
      </div>
      {showQR && (
        <QRModal url={url.shortUrl} onClose={() => setShowQR(false)} />
      )}
    </li>
  );
}
