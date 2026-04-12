const taskModel = require("../models/taskModel");

exports.list = (req, res) => {
  const done = req.query.done;
  let filter = {};
  if (done === "true") filter.done = true;
  if (done === "false") filter.done = false;
  res.json(taskModel.findAll(filter));
};

exports.getById = (req, res) => {
  const id = Number(req.params.id);
  const task = taskModel.findById(id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
};

exports.create = (req, res) => {
  const { title, priority } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }
  const task = taskModel.create({ title, priority });
  res.status(201).json(task);
};

exports.replace = (req, res) => {
  const id = Number(req.params.id);
  const existing = taskModel.findById(id);
  if (!existing) return res.status(404).json({ error: "Task not found" });
  const { title, done, priority } = req.body;
  const updated = taskModel.update(id, { title, done, priority });
  res.json(updated);
};

exports.patch = (req, res) => {
  const id = Number(req.params.id);
  const existing = taskModel.findById(id);
  if (!existing) return res.status(404).json({ error: "Task not found" });
  const updated = taskModel.update(id, req.body);
  res.json(updated);
};

exports.remove = (req, res) => {
  const id = Number(req.params.id);
  const removed = taskModel.remove(id);
  if (!removed) return res.status(404).json({ error: "Task not found" });
  res.json({ deleted: true, task: removed });
};
