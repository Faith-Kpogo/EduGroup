// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const usersController = require("../controllers/usersController");

// ✅ Get logged-in user's info
router.get("/me", authenticateToken, usersController.getMe);

// ✅ Update preferences

// ✅ Delete own account
router.delete("/me", authenticateToken, usersController.deleteAccount);
router.patch("/me/password", authenticateToken, usersController.changePassword);

module.exports = router;
