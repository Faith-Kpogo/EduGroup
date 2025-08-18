// controllers/groupsController.js
const db = require('../models/db');

exports.getRecentGroups = (req, res) => {
  const userId = req.user.id; // lecturer from token

  const query = `
    SELECT g.id, g.group_name, g.created_at, g.status,
           c.course_name,
           COUNT(gm.student_id) AS student_count
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN courses c ON g.course_id = c.id
    WHERE g.created_by = ?
    GROUP BY g.id, g.group_name, g.created_at, g.status, c.course_name
    ORDER BY g.created_at DESC
    LIMIT 5
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching recent groups:", err);
      return res.status(500).json({ message: "Error fetching groups" });
    }
    res.json(results);
  });
};
