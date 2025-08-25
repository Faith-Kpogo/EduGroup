const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());   // ✅ This is required to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // optional but helpful
const authRoutes = require('./routes/authRoutes');
// Middleware to debug request body
app.use((req, res, next) => {
  console.log('BODY DEBUG:', req.body); // should print the JSON from Postman
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Edugroup backend is working!');
});

// Test admin route (without auth for testing)
app.get('/api/admin/test', (req, res) => {
  res.json({ message: 'Admin route is accessible!' });
});

// Test database connection
app.get('/api/test-db', (req, res) => {
  const db = require('./models/db');
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      res.json({ error: err.message, message: 'Database connection failed!' });
    } else {
      res.json({ message: 'Database connected successfully!', results });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const departmentRoutes = require('./routes/departmentRoutes');
app.use('/api/departments', departmentRoutes);
app.use('/api/department', departmentRoutes);


const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const courseRoutes = require("./routes/courseRoutes");
app.use("/api/courses", courseRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);