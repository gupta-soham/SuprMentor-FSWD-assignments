/**
 * Connect the Stack — backend
 * In-memory tasks + CORS for Vite dev server (default http://localhost:5173)
 * PORT=4008 (default)
 */

const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 4008;
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.json());

let tasks = [];
let nextId = 1;

app.get("/api/tasks", (req, res) => {
  let list = [...tasks];
  if (req.query.done !== undefined) {
    const d = req.query.done === "true";
    list = list.filter((t) => t.done === d);
  }
  res.json(list.sort((a, b) => b.createdAt - a.createdAt));
});

app.get("/api/tasks/:id", (req, res) => {
  const t = tasks.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });
  res.json(t);
});

app.post("/api/tasks", (req, res) => {
  const { title, done } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title (string) required" });
  }
  const task = {
    id: String(nextId++),
    title: title.trim(),
    done: Boolean(done),
    createdAt: Date.now(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.put("/api/tasks/:id", (req, res) => {
  const t = tasks.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });
  if (req.body.title !== undefined) t.title = String(req.body.title).trim();
  if (req.body.done !== undefined) t.done = Boolean(req.body.done);
  res.json(t);
});

app.patch("/api/tasks/:id", (req, res) => {
  const t = tasks.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });
  if (req.body.title !== undefined) t.title = String(req.body.title).trim();
  if (req.body.done !== undefined) t.done = Boolean(req.body.done);
  res.json(t);
});

app.delete("/api/tasks/:id", (req, res) => {
  const i = tasks.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  const [removed] = tasks.splice(i, 1);
  res.json({ deleted: true, task: removed });
});

app.get("/", (req, res) => {
  res.json({ message: "Task API for Connect the Stack", tasks: "/api/tasks" });
});

app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
