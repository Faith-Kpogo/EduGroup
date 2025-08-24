// controllers/usersController.js


const db = require("../models/db");
// ✅ Get logged-in user's profile
exports.getMe = (req, res) => {
  const userId = req.user.id; // comes from JWT middleware

  const query = `
    SELECT 
      u.email, 
      CONCAT(u.first_name, ' ', u.last_name) AS name, 
      d.name AS department
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user info:", err);
      return res.status(500).json({ message: "Error fetching user info" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]); // ✅ send first row
  });
};
// ✅ Update user preferences

// ✅ Delete account
exports.deleteAccount = (req, res) => {
  const userId = req.user.id;
  const { email } = req.body; // ✅ email must be sent from frontend

  if (!email) {
    return res.status(400).json({ message: "Email is required for confirmation" });
  }

  const checkUserQuery = `SELECT email FROM users WHERE id = ?`;

  db.query(checkUserQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error checking user before deletion:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (results[0].email !== email) {
      return res.status(400).json({ message: "Email does not match account" });
    }

    const deleteQuery = `DELETE FROM users WHERE id = ?`;

    db.query(deleteQuery, [userId], (err2) => {
      if (err2) {
        console.error("Error deleting account:", err2);
        return res.status(500).json({ message: "Failed to delete account" });
      }

      res.json({ message: "Account deleted successfully" });
    });
  });
};



const bcrypt = require("bcryptjs");
// Change Password
exports.changePassword = (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new password are required" });
  }

  const query = `SELECT password_hash FROM users WHERE id = ?`;

  db.query(query, [userId], async (err, results) => {
    if (err) {
      console.error("Error fetching user password:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, results[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = `UPDATE users SET password_hash = ? WHERE id = ?`;
    db.query(updateQuery, [hashedPassword, userId], (err2) => {
      if (err2) {
        console.error("Error updating password:", err2);
        return res.status(500).json({ message: "Failed to update password" });
      }
      res.json({ message: "Password updated successfully" });
    });
  });
};
