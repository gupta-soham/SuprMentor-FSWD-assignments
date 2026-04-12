/**
 * Role Guard — Assignment 08 Apr 2026
 * Same auth as Secure Login + role in JWT + admin-only routes.
 *
 * npm run seed-admin  → create admin (see .env.example)
 * User signup → role "user"
 * GET /api/admin/users — Bearer admin token only
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");

const PORT = process.env.PORT || 4007;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/role_guard";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Role Guard API",
    auth: "/api/auth/signup, /login, /me",
    userArea: "GET /api/dashboard (Bearer)",
    adminOnly:
      "GET /api/admin/users, DELETE /api/admin/users/:id (Bearer admin)",
    seed: "npm run seed-admin",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() =>
    app.listen(PORT, () => console.log(`Role Guard http://localhost:${PORT}`)),
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
