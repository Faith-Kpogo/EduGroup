# Admin System Setup Guide

## 🚀 Quick Start

### 1. **Start the Backend Server**
```bash
cd "EduGroup Backend"
npm start
```

You should see:
- `Server running on port 5000`
- `Database connected successfully!`

### 2. **Set Up the Database**
- Open MySQL Workbench or phpMyAdmin
- Run the `database_setup.sql` file to create tables and sample data
- Or manually create the database and tables

### 3. **Test the Backend**
Visit these URLs in your browser:
- `http://localhost:5000/` - Should show "Edugroup backend is working!"
- `http://localhost:5000/api/admin/test` - Should show "Admin routes are working!"

### 4. **Test Admin Login**
- Go to your frontend: `http://localhost:3000`
- Login with: `admin@edugroup.com` / `admin123`
- You should be redirected to the admin page

## 🔧 Troubleshooting

### **"Error fetching lecturers" Issue**
This usually means:
1. **Backend not running** - Start with `npm start`
2. **Database not connected** - Check MySQL is running
3. **Tables don't exist** - Run the database setup script
4. **Authentication issue** - Make sure you're logged in as admin

### **Database Connection Issues**
Check your `models/db.js` file:
```javascript
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',           // Your MySQL username
  password: 'pa55w0rd',   // Your MySQL password
  database: 'edugroup'    // Your database name
});
```

### **Test Database Connection**
Add this to your backend to test:
```javascript
// In index.js, add this route:
app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      res.json({ error: err.message });
    } else {
      res.json({ message: 'Database connected!', results });
    }
  });
});
```

## 📊 Sample Data

The system comes with sample data:
- **Admin**: `admin@edugroup.com` / `admin123`
- **Lecturers**: `john.doe@university.edu` / `password123`
- **Students**: 4 sample students
- **Departments**: Computer Science, Mathematics, Physics, Engineering

## 🎯 What to Test

1. **Admin Login** - Should redirect to `/admin`
2. **Dashboard Stats** - Should show counts
3. **Lecturers Tab** - Should show 3 lecturers
4. **Students Tab** - Should show 4 students
5. **Groups Tab** - Should show any existing groups
6. **Add/Edit/Delete** - Test CRUD operations

## 🆘 Still Having Issues?

1. **Check browser console** for frontend errors
2. **Check terminal** for backend errors
3. **Check database** - tables exist and have data
4. **Verify ports** - Backend on 5000, Frontend on 3000

## 📝 Database Schema

Required tables:
- `users` - For lecturers and admin
- `students` - For student records
- `departments` - For department info
- `groups` - For group management
- `group_members` - For group assignments
- `courses` - For course information

Run `database_setup.sql` to create all tables automatically!
