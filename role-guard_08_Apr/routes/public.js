const express = require("express");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

/** Any logged-in user */
router.get("/dashboard", authRequired, (req, res) => {
  res.json({
    message: "Welcome to your dashboard",
    you: req.user,
  });
});

module.exports = router;
