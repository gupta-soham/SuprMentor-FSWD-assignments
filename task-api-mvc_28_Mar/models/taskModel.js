/**
 * Model layer — data access for tasks (in-memory).
 * Swap this module for Mongoose calls in CRUD Lab.
 */

let nextId = 3;
const tasks = [
  { id: 1, title: "Learn MVC pattern", done: false, priority: "high" },
  { id: 2, title: "Split routes/controllers", done: false, priority: "medium" },
];

function findAll(filter = {}) {
  let list = [...tasks];
  if (filter.done === true) list = list.filter((t) => t.done);
  if (filter.done === false) list = list.filter((t) => !t.done);
  return list;
}

function findById(id) {
  return tasks.find((t) => t.id === id) || null;
}

function create({ title, priority }) {
  const task = {
    id: ++nextId,
    title: title.trim(),
    done: false,
    priority: priority || "medium",
  };
  tasks.push(task);
  return task;
}

function update(id, body) {
  const task = findById(id);
  if (!task) return null;
  if (body.title != null) task.title = String(body.title).trim();
  if (typeof body.done === "boolean") task.done = body.done;
  if (body.priority != null) task.priority = String(body.priority);
  return task;
}

function remove(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  return tasks.splice(idx, 1)[0];
}

module.exports = { findAll, findById, create, update, remove };
