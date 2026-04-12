/**
 * Secure Login — Assignment 06 Apr 2026
 * Signup / login with bcrypt + JWT. Protected GET /api/auth/me
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");

const PORT = process.env.PORT || 4006;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/secure_login";

if (!process.env.JWT_SECRET) {
  console.warn("WARN: JWT_SECRET not set; using insecure default for dev only");
}

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Secure Login API",
    signup: "POST /api/auth/signup { email, password }",
    login: "POST /api/auth/login { email, password }",
    me: "GET /api/auth/me Authorization: Bearer <token>",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Secure Login http://localhost:${PORT}`),
    ),
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
