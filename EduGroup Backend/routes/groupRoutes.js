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

// ✅ Update batch status (Active/Inactive) — ⚠️ must come BEFORE :groupId
router.put("/batch/:batchId/status", authenticateToken, groupController.updateBatchStatus);

// ✅ Groups History
router.get("/history", authenticateToken, groupController.getGroupsHistory);

// ✅ Get details for a specific group
router.get("/:groupId", authenticateToken, groupController.getGroupDetails);

// ✅ Delete specific group
router.delete("/:groupId", authenticateToken, groupController.deleteGroup);

// ✅ Delete entire batch
router.delete("/batch/:batchId", authenticateToken, groupController.deleteBatch);

module.exports = router;
