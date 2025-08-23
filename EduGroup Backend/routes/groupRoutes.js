const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

// ✅ Get recent groups for logged-in lecturer
router.get("/recent", authenticateToken, groupController.getRecentGroups);

// ✅ Generate new groups (requires courseId, studentsPerGroup OR numberOfGroups)
router.post("/generate", authenticateToken, groupController.generateGroups);

// ✅ Create a new group manually (requires courseId now)
router.post("/", authenticateToken, groupController.createGroup);

// ✅ Get all groups in a batch
router.get("/batch/:batchId", authenticateToken, groupController.getGroupsByBatch);

// ✅ Get details for a specific group
router.get("/:groupId", authenticateToken, groupController.getGroupDetails);

module.exports = router;
