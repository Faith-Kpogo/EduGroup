const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"; // ✅ use env var or fallback

exports.signup = (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = `
    INSERT INTO users (first_name, last_name, email, password_hash, role)
    VALUES (?, ?, ?, ?, 'lecturer')
  `;

  db.query(sql, [first_name, last_name, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already in use' });
      }
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Error creating user' });
    }

    const token = jwt.sign(
      { id: result.insertId, email, role: 'lecturer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'User created successfully', token });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Admin login
  if (email === 'admin@edugroup.com' && password === 'admin123') {
    const token = jwt.sign(
      { id: 'admin', email: 'admin@edugroup.com', isAdmin: true },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      token,
      first_name: 'Admin',
      last_name: 'User',
      isAdmin: true,
      departmentSelected: false
    });
  }

  // Regular user login
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const user = results[0];

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const deptQuery = `SELECT * FROM user_departments WHERE user_id = ? LIMIT 1`;
    db.query(deptQuery, [user.id], (deptErr, deptResults) => {
      if (deptErr) return res.status(500).json({ message: 'Error checking department' });

      res.json({
        token,
        first_name: user.first_name,
        last_name: user.last_name,
        isAdmin: false,
        departmentSelected: deptResults.length > 0
      });
    });
  });
};
