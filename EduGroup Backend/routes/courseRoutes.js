const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const courseController = require("../controllers/courseController");

// Get courses for lecturer's department
router.get("/", authenticateToken, courseController.getCoursesByDepartment);

module.exports = router;
