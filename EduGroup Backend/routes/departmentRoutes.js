const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authenticateToken = require('../middleware/auth'); // JWT middleware

// Get all departments
router.get('/', departmentController.getDepartments);

// Select department (protected route)
router.post('/select', authenticateToken, departmentController.selectDepartment);

module.exports = router;
// routes/departmentRoutes.js
router.get('/check', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `SELECT * FROM user_departments WHERE user_id = ? LIMIT 1`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error checking department' });
    if (results.length > 0) {
      res.json({ hasDepartment: true });
    } else {
      res.json({ hasDepartment: false });
    }
  });
});
