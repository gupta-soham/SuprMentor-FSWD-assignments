/**
 * Task API — Assignment 27 Mar 2026
 * CRUD in memory. Test with Postman (see postman folder).
 *
 * npm install && npm start  →  http://localhost:4001
 */

const express = require("express");

const app = express();
const PORT = process.env.PORT || 4001;

let nextId = 3;
const tasks = [
  { id: 1, title: "Learn Express routes", done: false, priority: "high" },
  { id: 2, title: "Write Postman tests", done: false, priority: "medium" },
];

app.use(express.json());

app.get("/api/tasks", (req, res) => {
  const { done } = req.query;
  let list = tasks;
  if (done === "true") list = tasks.filter((t) => t.done);
  if (done === "false") list = tasks.filter((t) => !t.done);
  res.json(list);
});

app.get("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { title, priority } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }
  const task = {
    id: ++nextId,
    title: title.trim(),
    done: false,
    priority: priority || "medium",
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  const { title, done, priority } = req.body;
  if (title != null) task.title = String(title).trim();
  if (typeof done === "boolean") task.done = done;
  if (priority != null) task.priority = String(priority);
  res.json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (typeof req.body.done === "boolean") task.done = req.body.done;
  if (req.body.title != null) task.title = String(req.body.title).trim();
  if (req.body.priority != null) task.priority = String(req.body.priority);
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });
  const [removed] = tasks.splice(idx, 1);
  res.json({ deleted: true, task: removed });
});

app.get("/", (req, res) => {
  res.json({
    message: "Task API",
    docs: "GET/POST /api/tasks, GET/PUT/PATCH/DELETE /api/tasks/:id",
  });
});

app.listen(PORT, () => console.log(`Task API http://localhost:${PORT}`));
