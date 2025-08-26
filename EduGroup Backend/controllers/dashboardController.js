// controllers/dashboardController.js
const db = require('../models/db');

exports.getDashboard = (req, res) => {
  const userId = req.user.id;

  // Prefer department from user_departments (primary). Fallback to users.department_id for legacy accounts
  const deptQuery = `
    SELECT d.id AS department_id
    FROM user_departments ud
    JOIN departments d ON d.id = ud.department_id
    WHERE ud.user_id = ? AND ud.is_primary = TRUE
    UNION ALL
    SELECT u.department_id
    FROM users u
    WHERE u.id = ? AND u.department_id IS NOT NULL
    LIMIT 1
  `;

  db.query(deptQuery, [userId, userId], (err, deptResult) => {
    if (err) {
      console.error("Error fetching department:", err);
      return res.status(500).json({ message: "Error fetching department" });
    }

    if (!deptResult || deptResult.length === 0 || !deptResult[0].department_id) {
      // No department selected yet; return zeros for department-dependent stats
      return res.json({ departmentStudents: 0, totalGroups: 0, activeGroups: 0, groupedStudents: 0 });
    }

    const departmentId = deptResult[0].department_id;

    const statsQuery = `
      SELECT 
        -- total students in lecturer's department (exclude imported-only placeholder data)
        (
          SELECT COUNT(DISTINCT s.id)
          FROM students s
          LEFT JOIN student_courses sc ON sc.student_id = s.id
          LEFT JOIN courses c ON c.id = sc.course_id
          WHERE s.department_id = ?
            AND (c.id IS NULL OR c.course_code NOT LIKE 'IMP-%')
            AND (s.email IS NULL OR s.email NOT LIKE '%@students.local')
        ) AS departmentStudents,

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

    db.query(statsQuery, [departmentId, userId, userId, userId], (err2, results) => {
      if (err2) {
        console.error("Dashboard query error:", err2);
        return res.status(500).json({ message: "Error fetching dashboard stats" });
      }

      res.json(results[0]);
    });
  });
};
