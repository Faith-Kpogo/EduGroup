const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');


exports.signup = (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [first_name, last_name, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already in use' });
      }
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Error creating user' });
    }

    const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User created successfully', token });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const user = results[0];

    // Check password
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Check if user already has a department
    const deptQuery = `SELECT * FROM user_departments WHERE user_id = ? LIMIT 1`;
    db.query(deptQuery, [user.id], (deptErr, deptResults) => {
      if (deptErr) return res.status(500).json({ message: 'Error checking department' });

      res.json({
        token,
        first_name: user.first_name,
        last_name: user.last_name,
        departmentSelected: deptResults.length > 0
      });
    });
  });
};
