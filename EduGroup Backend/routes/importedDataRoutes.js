const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const importedDataController = require("../controllers/importedDataController");

// Apply authentication to all routes
router.use(authenticateToken);

// Store imported data
router.post("/store", importedDataController.storeImportedData);

// Get imported data by ID
router.get("/:importId", importedDataController.getImportedData);

// Get all imported data (admin only)
router.get("/", importedDataController.getAllImportedData);

// Delete imported data
router.delete("/:importId", importedDataController.deleteImportedData);

// Get imported data statistics (admin only)
router.get("/stats/overview", importedDataController.getImportedDataStats);

module.exports = router;
