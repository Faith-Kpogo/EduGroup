const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());   // ✅ This is required to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // optional but helpful
 // ⬅️ this is 100% necessary
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
