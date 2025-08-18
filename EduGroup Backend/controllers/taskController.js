const db = require("../models/db");

// ✅ Create a new task
// ✅ Create a new task
exports.createTask = (req, res) => {
  const { title, description, due_date } = req.body;
  const userId = req.user.id; // comes from token

  console.log("BODY DEBUG:", req.body); // keep this

  if (!title || !due_date) {
    return res.status(400).json({ message: "Title and due date are required" });
  }

  const query = `
    INSERT INTO tasks (title, description, task_type, due_date, priority, status, created_by)
    VALUES (?, ?, 'assignment', ?, 'medium', 'pending', ?)
  `;

  db.query(query, [title, description, due_date, userId], (err, result) => {
    if (err) {
      console.error("❌ Error creating task:", err.sqlMessage);  // show SQL error clearly
      console.error("SQL:", err.sql); // log the exact query MySQL tried
      return res.status(500).json({ message: "Error creating task", error: err.sqlMessage });
    }
    console.log("✅ Task created:", result.insertId);
    res.status(201).json({ message: "Task created successfully", taskId: result.insertId });
  });
};


// ✅ Get tasks for logged-in lecturer
exports.getTasks = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT id, title, description, due_date, created_at
    FROM tasks
    WHERE created_by = ?
    ORDER BY due_date ASC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ message: "Error fetching tasks" });
    }
    res.json(results);
  });
};
