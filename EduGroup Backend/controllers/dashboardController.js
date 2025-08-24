// controllers/dashboardController.js
const db = require('../models/db');

exports.getDashboard = (req, res) => {
  const userId = req.user.id;

  // First get lecturer's department_id
  const deptQuery = `SELECT department_id FROM users WHERE id = ?`;

  db.query(deptQuery, [userId], (err, deptResult) => {
    if (err) {
      console.error("Error fetching department:", err);
      return res.status(500).json({ message: "Error fetching department" });
    }

    if (!deptResult || deptResult.length === 0) {
      return res.status(404).json({ message: "Department not found for user" });
    }

    const departmentId = deptResult[0].department_id;

    const statsQuery = `
      SELECT 
        -- total students in lecturer's department
        (SELECT COUNT(*) 
         FROM students s
         WHERE s.department_id = ?) AS departmentStudents,

        -- all groups created by lecturer
        (SELECT COUNT(*) 
         FROM \`groups\` g
         WHERE g.created_by = ?) AS totalGroups,

        -- active groups created by lecturer
        (SELECT COUNT(*) 
         FROM \`groups\` g
         WHERE g.created_by = ? AND g.status = 'Active') AS activeGroups,

        -- total student assignments (includes duplicates if a student is in multiple groups)
        (SELECT COUNT(gm.student_id)
         FROM group_members gm
         JOIN \`groups\` g ON gm.group_id = g.id
         WHERE g.created_by = ?) AS groupedStudents
    `;

    db.query(statsQuery, [departmentId, userId, userId, userId], (err, results) => {
      if (err) {
        console.error("Dashboard query error:", err);
        return res.status(500).json({ message: "Error fetching dashboard stats" });
      }

      res.json(results[0]);
    });
  });
};
