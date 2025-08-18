const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const groupController = require('../controllers/groupController');

// Get recent groups for logged-in lecturer
router.get("/recent", authenticateToken, groupController.getRecentGroups);

module.exports = router;
