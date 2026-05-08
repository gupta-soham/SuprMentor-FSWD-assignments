const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Heatmap({ data = [] }) {
  if (!data || data.length !== 168) return null;

  const max = Math.max(1, ...data);

  return (
    <div className="heatmap">
      <div className="heatmap__header">
        <div className="heatmap__corner" />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={`h-${h}`} className="heatmap__hour-label">
            {h % 4 === 0 ? h : ""}
          </div>
        ))}
      </div>

      {DAYS.map((day, d) => (
        <div key={day} className="heatmap__row">
          <div className="heatmap__day-label">{day}</div>
          {Array.from({ length: 24 }, (_, h) => {
            const value = data[d * 24 + h];
            const intensity = value / max;
            return (
              <div
                key={`${d}-${h}`}
                className="heatmap__cell"
                title={`${day} ${h}:00 \u2013 ${value} click${value !== 1 ? "s" : ""}`}
                style={{
                  backgroundColor:
                    value === 0
                      ? "var(--bg-tertiary)"
                      : `rgba(106, 95, 193, ${(0.18 + intensity * 0.82).toFixed(2)})`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
