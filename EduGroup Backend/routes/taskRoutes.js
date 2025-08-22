const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticateToken = require("../middleware/authMiddleware");

// Create a new task
router.post("/", authenticateToken, taskController.createTask);

// Get lecturer's tasks
router.get("/", authenticateToken, taskController.getTasks);
router.delete("/:id", authenticateToken, taskController.deleteTask);
// Update task
router.put("/:id", authenticateToken, taskController.updateTask);


module.exports = router;
