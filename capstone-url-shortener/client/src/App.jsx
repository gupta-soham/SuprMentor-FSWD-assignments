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
    <div className="app">
      <header className="header">
        <h1 className="logo">Snip</h1>
        <span className="tagline">URL Shortener</span>
      </header>

      <ShortenForm onShortened={load} />

      <div key={selectedCode || "list"} className="view-enter">
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
    </div>
  );
}
