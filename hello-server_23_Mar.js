/**
 * Hello Server — Assignment 23rd March 2026
 *
 * Run: node hello-server_23_Mar.js
 * Then open http://localhost:3000 (and other paths below)
 */

const http = require("http");

const PORT = process.env.PORT || 3000;

const routes = {
  "/": {
    status: 200,
    body: "Hello! Welcome to the home route. Try /about, /api/health, or /contact.",
  },
  "/about": {
    status: 200,
    body: "About: This is a tiny Node.js HTTP server with multiple routes for learning.",
  },
  "/contact": {
    status: 200,
    body: "Contact: Reach us at hello@example.com (demo message).",
  },
  "/api/health": {
    status: 200,
    body: JSON.stringify({
      ok: true,
      service: "hello-server",
      uptime: process.uptime(),
    }),
    contentType: "application/json; charset=utf-8",
  },
  "/api/time": {
    status: 200,
    body: JSON.stringify({ iso: new Date().toISOString() }),
    contentType: "application/json; charset=utf-8",
  },
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path = url.pathname;
  const route = routes[path];

  if (route) {
    res.writeHead(route.status, {
      "Content-Type": route.contentType || "text/plain; charset=utf-8",
    });
    res.end(route.body);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(
    `404 — No route for "${path}". Known: ${Object.keys(routes).join(", ")}`,
  );
});

server.listen(PORT, () => {
  console.log(`Hello Server listening on http://localhost:${PORT}`);
  console.log("Routes:", Object.keys(routes).join(", "));
});
