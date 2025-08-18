// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

// Protected dashboard route
router.get('/', authenticateToken, dashboardController.getDashboard);

module.exports = router;
