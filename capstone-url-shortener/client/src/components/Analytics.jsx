import { useEffect, useState } from "react";
import { getStats } from "../api/urlApi.js";
import Globe from "./Globe.jsx";
import Heatmap from "./Heatmap.jsx";
import QRModal from "./QRModal.jsx";

function AnimatedNumber({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!value) {
      setCount(0);
      return;
    }
    let frame;
    const duration = 400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{count}</>;
}

function BarChart({ data, colorClass = "bar-fill--purple" }) {
  if (!data || data.length === 0) {
    return <p className="chart-empty">No data yet</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="bar-chart">
      {data.slice(0, 6).map((item, i) => (
        <div
          key={item.name}
          className="bar-row"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className="bar-label" title={item.name}>
            {item.name}
          </span>
          <div className="bar-track">
            <div
              className={`bar-fill ${colorClass}`}
              style={{
                width: `${(item.count / max) * 100}%`,
                animationDelay: `${i * 80 + 200}ms`,
              }}
            />
          </div>
          <span className="bar-value">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics({ code, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    getStats(code)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [code]);

  if (error) {
    return (
      <div className="analytics">
        <button onClick={onBack} className="back-btn">
          Back
        </button>
        <p className="form-error">{error}</p>
      </div>
    );
  }

  if (!data) return <p className="loading-text">Loading stats...</p>;

  const byDay = {};
  (data.recentClicks || []).forEach((c) => {
    const day = new Date(c.timestamp).toLocaleDateString();
    byDay[day] = (byDay[day] || 0) + 1;
  });
  const dayData = Object.entries(byDay).map(([name, count]) => ({
    name,
    count,
  }));

  const hasCountries = data.countries && data.countries.length > 0;
  const hasHeatmap =
    data.hourlyActivity && data.hourlyActivity.some((v) => v > 0);
  const hasDevices = data.devices && data.devices.length > 0;
  const hasBrowsers = data.browsers && data.browsers.length > 0;
  const hasOS = data.operatingSystems && data.operatingSystems.length > 0;
  const hasReferrers = data.referrers && data.referrers.length > 0;

  let expiryLabel = "Never";
  if (data.expiresAt) {
    const diff = new Date(data.expiresAt) - Date.now();
    if (diff <= 0) {
      expiryLabel = "Expired";
    } else {
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      expiryLabel = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
    }
  }

  return (
    <div className="analytics">
      <div className="analytics-top-row">
        <button onClick={onBack} className="back-btn">
          Back to list
        </button>
        <button onClick={() => setShowQR(true)} className="btn-secondary">
          QR Code
        </button>
      </div>

      <h2 className="analytics-title">/{data.shortCode}</h2>
      <p className="analytics-url">
        <a href={data.longUrl} target="_blank" rel="noopener noreferrer">
          {data.longUrl.length > 70
            ? data.longUrl.slice(0, 67) + "..."
            : data.longUrl}
        </a>
      </p>

      <div className="stat-grid">
        <div className="stat-card" style={{ animationDelay: "0ms" }}>
          <div className="stat-card__label">Total Clicks</div>
          <div className="stat-card__value">
            <AnimatedNumber value={data.clicks} />
          </div>
        </div>
        <div className="stat-card" style={{ animationDelay: "60ms" }}>
          <div className="stat-card__label">Unique Visitors</div>
          <div className="stat-card__value">
            <AnimatedNumber value={data.uniqueVisitors || 0} />
          </div>
        </div>
        <div className="stat-card" style={{ animationDelay: "120ms" }}>
          <div className="stat-card__label">
            {data.expiresAt ? "Expires In" : "Created"}
          </div>
          <div className="stat-card__value stat-card__value--sm">
            {data.expiresAt
              ? expiryLabel
              : new Date(data.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="chart-grid chart-grid--top">
        <div className="chart-section" style={{ animationDelay: "150ms" }}>
          <h3 className="chart-section__title">Visitor Map</h3>
          <Globe markers={data.geoLocations || []} />
        </div>
        {hasCountries && (
          <div className="chart-section" style={{ animationDelay: "200ms" }}>
            <h3 className="chart-section__title">Countries</h3>
            <BarChart data={data.countries} colorClass="bar-fill--purple" />
          </div>
        )}
      </div>

      {hasHeatmap && (
        <div className="chart-section" style={{ animationDelay: "250ms" }}>
          <h3 className="chart-section__title">Activity Heatmap</h3>
          <Heatmap data={data.hourlyActivity} />
        </div>
      )}

      {dayData.length > 0 && (
        <div className="chart-section" style={{ animationDelay: "300ms" }}>
          <h3 className="chart-section__title">Clicks by Day</h3>
          <BarChart data={dayData} colorClass="bar-fill--purple" />
        </div>
      )}

      <div className="chart-grid">
        {hasDevices && (
          <div className="chart-section" style={{ animationDelay: "350ms" }}>
            <h3 className="chart-section__title">Devices</h3>
            <BarChart data={data.devices} colorClass="bar-fill--coral" />
          </div>
        )}
        {hasBrowsers && (
          <div className="chart-section" style={{ animationDelay: "400ms" }}>
            <h3 className="chart-section__title">Browsers</h3>
            <BarChart data={data.browsers} colorClass="bar-fill--purple" />
          </div>
        )}
      </div>

      <div className="chart-grid">
        {hasOS && (
          <div className="chart-section" style={{ animationDelay: "450ms" }}>
            <h3 className="chart-section__title">Operating Systems</h3>
            <BarChart
              data={data.operatingSystems}
              colorClass="bar-fill--pink"
            />
          </div>
        )}
        {hasReferrers && (
          <div className="chart-section" style={{ animationDelay: "500ms" }}>
            <h3 className="chart-section__title">Referrers</h3>
            <BarChart data={data.referrers} colorClass="bar-fill--lime" />
          </div>
        )}
      </div>

      {showQR && (
        <QRModal url={data.shortUrl} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}
