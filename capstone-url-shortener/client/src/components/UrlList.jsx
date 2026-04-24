import UrlCard from "./UrlCard.jsx";

export default function UrlList({
  urls,
  total,
  loading,
  onDeleted,
  onViewStats,
}) {
  if (loading) return <p style={{ color: "#888" }}>Loading...</p>;

  return (
    <section>
      <h2 style={styles.heading}>
        Shortened URLs <span style={styles.count}>({total})</span>
      </h2>
      {urls.length === 0 ? (
        <p style={{ color: "#999" }}>No URLs shortened yet.</p>
      ) : (
        <ul style={styles.list}>
          {urls.map((u) => (
            <UrlCard
              key={u.shortCode}
              url={u}
              onDeleted={onDeleted}
              onViewStats={onViewStats}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

const styles = {
  heading: { fontSize: "1.15rem", margin: "0 0 0.75rem" },
  count: { fontWeight: 400, color: "#888", fontSize: "0.9rem" },
  list: {
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
