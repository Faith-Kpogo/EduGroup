const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// =================== SIGNUP ===================
exports.signup = (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = `
    INSERT INTO users (first_name, last_name, email, password_hash, role, email_verified)
    VALUES (?, ?, ?, ?, 'teacher', 0)
  `;

  db.query(sql, [first_name, last_name, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already in use" });
      }
      console.error("Error inserting user:", err);
      return res.status(500).json({ message: "Error creating user" });
    }

    const userId = result.insertId;

    // Generate raw token & hash it
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Save hashed token in DB
    const insertTokenSql = `
      INSERT INTO verification_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `;
    db.query(insertTokenSql, [userId, tokenHash, expiresAt], (tokenErr) => {
      if (tokenErr) {
        console.error("Error saving verification token:", tokenErr);
        return res.status(500).json({ message: "Error generating verification token" });
      }

      // Verification link should hit backend to perform verification, then redirect to frontend success page
      const verifyLink = `${SERVER_URL}/api/auth/verify-email?token=${rawToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your EduGroup account",
        html: `
          <h3>Welcome to EduGroup, ${first_name}!</h3>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verifyLink}">${verifyLink}</a>
        `,
      };

      // Send email
      transporter.sendMail(mailOptions, (mailErr) => {
        if (mailErr) {
          console.error("Error sending email:", mailErr);
          return res.status(500).json({ message: "User created but failed to send verification email" });
        }

        res.status(201).json({
          message: "User created successfully. Please check your email to verify your account.",
        });
      });
    });
  });
};

// =================== VERIFY EMAIL ===================
// ✅ In verifyEmail
exports.verifyEmail = (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  try {
    // Token is a random string. Validate by hashing and matching DB record.
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const findTokenSql = `SELECT user_id, expires_at FROM verification_tokens WHERE token_hash = ? LIMIT 1`;
    db.query(findTokenSql, [tokenHash], (findErr, rows) => {
      if (findErr) {
        console.error("Error finding verification token:", findErr);
        return res.status(500).send("Error verifying email");
      }

      if (!rows || rows.length === 0) {
        return res.redirect(`${CLIENT_URL}/verify-failed`);
      }

      const { user_id: userId, expires_at: expiresAt } = rows[0];
      if (new Date(expiresAt).getTime() < Date.now()) {
        // Expired: clean up token and redirect fail
        db.query(`DELETE FROM verification_tokens WHERE token_hash = ?`, [tokenHash], () => {
          return res.redirect(`${CLIENT_URL}/verify-failed`);
        });
        return;
      }

      // Mark user as verified
      const verifyUserSql = `UPDATE users SET email_verified = 1 WHERE id = ?`;
      db.query(verifyUserSql, [userId], (verifyErr) => {
        if (verifyErr) {
          console.error("Error verifying email:", verifyErr);
          return res.status(500).send("Error verifying email");
        }

        // Delete all tokens for this user
        db.query(`DELETE FROM verification_tokens WHERE user_id = ?`, [userId], () => {
          return res.redirect(`${CLIENT_URL}/verify-success`);
        });
      });
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.redirect(`${CLIENT_URL}/verify-failed`);
  }
};

// =================== LOGIN ===================
exports.login = (req, res) => {
  const { email, password } = req.body;

  // ✅ Admin login (hardcoded)
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
      departmentSelected: false,
      department_name: null
    });
  }

  // ✅ Regular user login
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const user = results[0];

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✅ Must be verified
    if (!user.email_verified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresVerification: true,   // 👈 added flag
        email: user.email             // 👈 send email so frontend can prefill verify page
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Now join with departments to get department name
    const deptQuery = `
      SELECT d.name AS department_name
      FROM user_departments ud
      JOIN departments d ON ud.department_id = d.id
      WHERE ud.user_id = ?
      LIMIT 1
    `;

    db.query(deptQuery, [user.id], (deptErr, deptResults) => {
      if (deptErr) return res.status(500).json({ message: 'Error checking department' });

      const department_name = deptResults.length > 0 ? deptResults[0].department_name : null;

      res.json({
        token,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        isAdmin: false,
        departmentSelected: !!department_name,
        department_name
      });
    });
  });
};

// =================== RESEND VERIFICATION ===================
exports.resendVerification = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const userQuery = `SELECT id, first_name, email_verified FROM users WHERE email = ?`;
  db.query(userQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    if (user.email_verified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save token (delete old first)
    db.query(`DELETE FROM verification_tokens WHERE user_id = ?`, [user.id], () => {
      db.query(
        `INSERT INTO verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
        [user.id, tokenHash, expiresAt],
        (err2) => {
          if (err2) {
            console.error("Error saving verification token:", err2);
            return res.status(500).json({ message: "Error creating token" });
          }

          // Send email
          const verifyLink = `${SERVER_URL}/api/auth/verify-email?token=${token}`;
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Resend: Verify your EduGroup account",
            html: `
              <h3>Hello ${user.first_name},</h3>
              <p>Please verify your email by clicking the link below:</p>
              <a href="${verifyLink}">${verifyLink}</a>
            `,
          };

          transporter.sendMail(mailOptions, (mailErr) => {
            if (mailErr) {
              console.error("Error sending email:", mailErr);
              return res.status(500).json({ message: "Failed to send email" });
            }
            res.json({ message: "Verification email resent successfully" });
          });
        }
      );
    });
  });
};

