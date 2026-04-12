const express = require("express");
const taskController = require("../controllers/taskController");

const router = express.Router();

router.get("/", taskController.list);
router.get("/:id", taskController.getById);
router.post("/", taskController.create);
router.put("/:id", taskController.replace);
router.patch("/:id", taskController.patch);
router.delete("/:id", taskController.remove);

module.exports = router;
