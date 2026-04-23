import { useCallback, useEffect, useState } from "react";
import ShortenForm from "./components/ShortenForm.jsx";
import UrlList from "./components/UrlList.jsx";
import Analytics from "./components/Analytics.jsx";
import { listUrls } from "./api/urlApi.js";

export default function App() {
  const [urls, setUrls] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUrls();
      setUrls(data.urls);
      setTotal(data.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Snip</h1>
        <span style={styles.tagline}>URL Shortener</span>
      </header>

      <ShortenForm onShortened={load} />

      {selectedCode ? (
        <Analytics code={selectedCode} onBack={() => setSelectedCode(null)} />
      ) : (
        <UrlList
          urls={urls}
          total={total}
          loading={loading}
          onDeleted={load}
          onViewStats={setSelectedCode}
        />
      )}
    </div>
  );
}

const styles = {
  shell: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    maxWidth: 640,
    margin: "0 auto",
    padding: "2rem 1rem",
    color: "#1a1a2e",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    marginBottom: "1.5rem",
  },
  logo: { fontSize: "2rem", margin: 0, letterSpacing: "-0.03em" },
  tagline: { fontSize: "0.95rem", color: "#666" },
};
