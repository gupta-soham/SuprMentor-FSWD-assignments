import { deleteUrl } from "../api/urlApi.js";

export default function UrlCard({ url, onDeleted, onViewStats }) {
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

  return (
    <li style={styles.card}>
      <div style={styles.top}>
        <a
          href={url.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.short}
        >
          {url.shortUrl}
        </a>
        <span style={styles.clicks}>{url.clicks} clicks</span>
      </div>
      <p style={styles.long} title={url.longUrl}>
        {url.longUrl.length > 80
          ? url.longUrl.slice(0, 77) + "..."
          : url.longUrl}
      </p>
      <div style={styles.actions}>
        <button onClick={copy} style={styles.btn}>
          Copy
        </button>
        <button onClick={() => onViewStats(url.shortCode)} style={styles.btn}>
          Stats
        </button>
        <button
          onClick={handleDelete}
          style={{ ...styles.btn, color: "#c0392b" }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: "0.9rem 1rem",
    listStyle: "none",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  short: {
    fontWeight: 600,
    color: "#2980b9",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  clicks: { fontSize: "0.82rem", color: "#888" },
  long: {
    fontSize: "0.82rem",
    color: "#555",
    margin: "0.35rem 0 0.5rem",
    wordBreak: "break-all",
  },
  actions: { display: "flex", gap: 8 },
  btn: {
    padding: "0.25rem 0.65rem",
    fontSize: "0.78rem",
    background: "#f4f4f4",
    border: "1px solid #ddd",
    borderRadius: 6,
    cursor: "pointer",
    color: "#333",
  },
};
