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

        -- active groups created by lecturer
        (SELECT COUNT(*) 
         FROM \`groups\` g
         WHERE g.created_by = ?) AS activeGroups,

        -- total students in groups created by lecturer
        (SELECT COUNT(DISTINCT gm.student_id)
         FROM group_members gm
         JOIN \`groups\` g ON gm.group_id = g.id
         WHERE g.created_by = ?) AS groupedStudents
    `;

    db.query(statsQuery, [departmentId, userId, userId], (err, results) => {
      if (err) {
        console.error("Dashboard query error:", err);
        return res.status(500).json({ message: "Error fetching dashboard stats" });
      }

      res.json(results[0]);
    });
  });
};
