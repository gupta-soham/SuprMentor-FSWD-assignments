import UrlCard from "./UrlCard.jsx";

export default function UrlList({
  urls,
  total,
  loading,
  onDeleted,
  onViewStats,
}) {
  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <section>
      <h2 className="list-heading">
        Shortened URLs <span className="list-count">({total})</span>
      </h2>
      {urls.length === 0 ? (
        <p className="url-list-empty">No URLs shortened yet.</p>
      ) : (
        <ul className="url-list">
          {urls.map((u, i) => (
            <UrlCard
              key={u.shortCode}
              url={u}
              index={i}
              onDeleted={onDeleted}
              onViewStats={onViewStats}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
