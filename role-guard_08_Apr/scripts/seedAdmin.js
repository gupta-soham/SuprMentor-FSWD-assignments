/**
 * Creates first admin if not exists. Run: npm run seed-admin
 * Set ADMIN_EMAIL / ADMIN_PASSWORD in .env (see .env.example)
 */
require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const mongoose = require("mongoose");
const User = require("../models/User");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/role_guard";
const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "admin123456";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log("Updated existing user to admin:", email);
    } else {
      console.log("Admin already exists:", email);
    }
    await mongoose.disconnect();
    return;
  }
  const hash = await User.hashPassword(password);
  await User.create({ email, passwordHash: hash, role: "admin" });
  console.log("Created admin:", email);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
