const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authRequired, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "password min 6 characters" });
    }
    const hash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash: hash });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({ error: "Email already registered" });
    res.status(400).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash",
    );
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user._id, email: user.email });
});

module.exports = router;
