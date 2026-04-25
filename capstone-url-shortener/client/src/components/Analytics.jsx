import { useEffect, useState } from "react";
import { getStats } from "../api/urlApi.js";

export default function Analytics({ code, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats(code)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [code]);

  if (error) {
    return (
      <div>
        <button onClick={onBack} style={styles.back}>
          Back
        </button>
        <p style={{ color: "#c0392b" }}>{error}</p>
      </div>
    );
  }

  if (!data) return <p style={{ color: "#888" }}>Loading stats...</p>;

  const byDay = {};
  (data.recentClicks || []).forEach((c) => {
    const day = new Date(c.timestamp).toLocaleDateString();
    byDay[day] = (byDay[day] || 0) + 1;
  });
  const maxClicks = Math.max(1, ...Object.values(byDay));

  return (
    <section>
      <button onClick={onBack} style={styles.back}>
        Back to list
      </button>

      <div style={styles.card}>
        <h2 style={styles.heading}>Stats for /{data.shortCode}</h2>
        <p style={styles.meta}>
          <strong>Long URL:</strong>{" "}
          <a
            href={data.longUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            {data.longUrl.length > 70
              ? data.longUrl.slice(0, 67) + "..."
              : data.longUrl}
          </a>
        </p>
        <p style={styles.meta}>
          <strong>Total clicks:</strong> {data.clicks}
        </p>
        <p style={styles.meta}>
          <strong>Created:</strong> {new Date(data.createdAt).toLocaleString()}
        </p>
      </div>

      {Object.keys(byDay).length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.subheading}>Recent clicks by day</h3>
          <div style={styles.chart}>
            {Object.entries(byDay).map(([day, count]) => (
              <div key={day} style={styles.bar}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${(count / maxClicks) * 100}%`,
                  }}
                />
                <span style={styles.barLabel}>
                  {day} — {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const styles = {
  back: {
    padding: "0.35rem 0.85rem",
    fontSize: "0.85rem",
    marginBottom: "1rem",
    background: "#f4f4f4",
    border: "1px solid #ddd",
    borderRadius: 6,
    cursor: "pointer",
  },
  card: {
    background: "#f8f9fa",
    borderRadius: 10,
    padding: "1rem 1.15rem",
    marginBottom: "1rem",
  },
  heading: { fontSize: "1.1rem", margin: "0 0 0.6rem" },
  subheading: { fontSize: "0.95rem", margin: "0 0 0.5rem" },
  meta: { fontSize: "0.88rem", margin: "0.3rem 0", color: "#444" },
  link: { color: "#2980b9", wordBreak: "break-all" },
  chart: { display: "flex", flexDirection: "column", gap: 6 },
  bar: {
    position: "relative",
    height: 26,
    background: "#e9ecef",
    borderRadius: 4,
  },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    background: "#2980b9",
    borderRadius: 4,
    transition: "width 0.3s",
  },
  barLabel: {
    position: "relative",
    zIndex: 1,
    padding: "0 8px",
    lineHeight: "26px",
    fontSize: "0.78rem",
    color: "#222",
  },
};
