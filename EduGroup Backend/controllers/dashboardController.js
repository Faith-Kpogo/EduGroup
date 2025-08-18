// controllers/dashboardController.js
const db = require('../models/db');

exports.getDashboard = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS totalStudents,
      (SELECT COUNT(*) FROM \`groups\`) AS activeGroups,
      (SELECT COUNT(*) 
         FROM activity_log 
         WHERE created_at >= NOW() - INTERVAL 7 DAY
      ) AS recentActivity
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Dashboard query error:", err);
      return res.status(500).json({ message: "Error fetching dashboard stats" });
    }

    res.json(results[0]);
  });
};
