const express = require("express");
const ctrl = require("../controllers/urlController");
const { validateUrl } = require("../middleware/validateUrl");
const { shortenLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/api/shorten", shortenLimiter, validateUrl, ctrl.shorten);
router.get("/api/urls", ctrl.listUrls);
router.get("/api/urls/:code/stats", ctrl.stats);
router.delete("/api/urls/:code", ctrl.deleteUrl);
router.get("/:code", ctrl.redirect);

module.exports = router;
