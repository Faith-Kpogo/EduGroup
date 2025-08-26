const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const courseController = require("../controllers/courseController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Get courses for lecturer's department
router.get("/", authenticateToken, courseController.getCoursesByDepartment);
// routes/courseRoutes.js
router.get("/:courseId/students", authenticateToken, courseController.getCourseStudents);

// ✅ Import students CSV into a course
router.post(
  "/:courseId/import",
  authenticateToken,
  upload.single("file"),
  courseController.importStudents
);

// ✅ Import students CSV without specifying a course (auto-create temporary course)
router.post(
  "/import",
  authenticateToken,
  upload.single("file"),
  courseController.importStudentsNoCourse
);


module.exports = router;
