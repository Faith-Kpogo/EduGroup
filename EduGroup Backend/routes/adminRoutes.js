const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// ✅ Test route (no auth required)
router.get("/test", (req, res) => {
  res.json({ message: "Admin routes are working!" });
});

// ✅ Admin middleware - check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

// ✅ Apply both authentication and admin check
router.use(authenticateToken, isAdmin);

// ✅ Lecturer management
router.get("/lecturers", adminController.getAllLecturers);
router.post("/lecturers", adminController.createLecturer);
router.put("/lecturers/:lecturerId", adminController.updateLecturer);
router.delete("/lecturers/:lecturerId", adminController.deleteLecturer);

// ✅ Student management
router.get("/students", adminController.getAllStudents);
router.post("/students", adminController.createStudent);
router.put("/students/:studentId", adminController.updateStudent);
router.delete("/students/:studentId", adminController.deleteStudent);

// ✅ Group management
router.get("/groups", adminController.getAllGroups);
router.delete("/groups/:groupId", adminController.deleteGroup);

// ✅ System management
router.get("/stats", adminController.getSystemStats);
router.get("/departments", adminController.getAllDepartments);

// ✅ Sample data creation (for testing)
router.post("/sample-data", adminController.createSampleData);

module.exports = router;
