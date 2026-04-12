/**
 * CRUD Lab — Assignment 03 Apr 2026
 * Mongoose CRUD for Product collection.
 *
 * 1. Copy .env.example → .env and start MongoDB locally (or use Atlas URI).
 * 2. npm install && npm start
 * 3. http://localhost:4005/api/products
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/products");

const PORT = process.env.PORT || 4005;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/crud_lab";

const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);
app.get("/", (req, res) => {
  res.json({ message: "CRUD Lab", products: "/api/products" });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`CRUD Lab http://localhost:${PORT} (Mongo connected)`),
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
