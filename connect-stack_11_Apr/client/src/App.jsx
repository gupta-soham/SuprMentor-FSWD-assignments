import { useCallback, useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4008";

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setErr("");
    try {
      const list = await api("/api/tasks");
      setTasks(list);
    } catch (e) {
      setErr(
        e.message ||
          "Failed to load tasks — is the API running on " + API + "?",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setErr("");
    try {
      await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTitle("");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function toggle(t) {
    setErr("");
    try {
      await api(`/api/tasks/${t.id}`, {
        method: "PATCH",
        body: JSON.stringify({ done: !t.done }),
      });
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function remove(t) {
    setErr("");
    try {
      await api(`/api/tasks/${t.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 520,
        margin: "2rem auto",
        padding: "0 1rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem" }}>Connect the Stack</h1>
      <p style={{ color: "#555", fontSize: "0.9rem" }}>
        React → <code>{API}</code>
      </p>
      {err && (
        <p
          style={{
            color: "#b00",
            background: "#fee",
            padding: "0.5rem 0.75rem",
            borderRadius: 6,
          }}
          role="alert"
        >
          {err}
        </p>
      )}
      <form
        onSubmit={addTask}
        style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title"
          style={{ flex: 1, padding: "0.5rem 0.75rem" }}
        />
        <button type="submit">Add</button>
      </form>
      {loading ? (
        <p>Loading…</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: "#888" }}>No tasks yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {tasks.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0.6rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <label
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggle(t)}
                />
                <span
                  style={{
                    textDecoration: t.done ? "line-through" : "none",
                    color: t.done ? "#888" : "#111",
                  }}
                >
                  {t.title}
                </span>
              </label>
              <button
                type="button"
                onClick={() => remove(t)}
                style={{ fontSize: "0.8rem" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
