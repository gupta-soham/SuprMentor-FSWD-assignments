/**
 * MVC Refactor — Assignment 28 Mar 2026
 *
 * Structure:
 *   models/     — data access
 *   controllers/ — HTTP handlers
 *   routes/      — URL → controller
 *
 * npm install && npm start  →  http://localhost:4002
 */

const express = require("express");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Task API (MVC)", base: "/api/tasks" });
});
app.use("/api/tasks", taskRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => console.log(`Task API MVC http://localhost:${PORT}`));
