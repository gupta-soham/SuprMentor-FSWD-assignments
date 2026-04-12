const express = require("express");
const User = require("../models/User");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired, requireRole("admin"));

/** List all users — admin only */
router.get("/users", async (req, res) => {
  const users = await User.find().select("-passwordHash").lean();
  res.json(users);
});

/** Delete a user by id — admin only */
router.delete("/users/:id", async (req, res) => {
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) return res.status(404).json({ error: "User not found" });
  res.json({ deleted: true, id: u._id });
});

module.exports = router;
