const db = require('../models/db');

// ✅ Get all departments
exports.getDepartments = (req, res) => {
  const sql = `SELECT code, name FROM departments`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ message: 'Error fetching departments' });
    }
    res.json(results);
  });
};

// ✅ Select department
exports.selectDepartment = (req, res) => {
  const { department_code } = req.body;
  const userId = req.user.id; // from JWT

  if (!department_code) {
    return res.status(400).json({ message: 'Department code is required' });
  }

  const findDept = `SELECT id FROM departments WHERE code = ?`;
  db.query(findDept, [department_code], (err, results) => {
    if (err) {
      console.error('Error checking department:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const departmentId = results[0].id;

    const insert = `
      INSERT INTO user_departments (user_id, department_id, is_primary)
      VALUES (?, ?, TRUE)
      ON DUPLICATE KEY UPDATE department_id = VALUES(department_id)
    `;

    db.query(insert, [userId, departmentId], (err2) => {
      if (err2) {
        console.error('Error inserting department selection:', err2);
        return res.status(500).json({ message: 'Error saving selection' });
      }

      res.status(200).json({ message: 'Department selected successfully' });
    });
  });
};
