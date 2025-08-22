// controllers/courseController.js
const db = require("../models/db");  // make sure db is imported

exports.getCoursesByDepartment = (req, res) => {
  const userId = req.user.id;
  const { level } = req.query;  // 👈 level from frontend query param

  let query = `
    SELECT c.id, c.course_code, c.course_name, c.level
    FROM courses c
    JOIN users u ON u.department_id = c.department_id
    WHERE u.id = ?
  `;
  const params = [userId];

  // If level is provided, filter by level
  if (level) {
    query += " AND c.level = ?";
    params.push(level);
  }

  query += " ORDER BY c.course_code";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Error fetching courses:", err);
      return res.status(500).json({ message: "Error fetching courses" });
    }

    if (!results.length) {
      return res.status(404).json({ message: "No courses found" });
    }

    res.json(results);
  });
};
