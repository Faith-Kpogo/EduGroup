# Admin Functionality Documentation

## Overview
The EduGroup system now includes comprehensive admin functionality that allows administrators to manage lecturers, students, groups, and view system statistics.

## Setup Instructions

### 1. Admin Access
The admin panel is accessible using hardcoded credentials:

- **Email**: admin@edugroup.com
- **Password**: admin123

**No setup required** - these credentials are built into the system.

### 2. Database Requirements
Make sure your database has the following tables with the correct structure:

#### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('lecturer', 'admin') DEFAULT 'lecturer',
  status ENUM('active', 'inactive') DEFAULT 'active',
  department_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Students Table
```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  index_number VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  email VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Groups Table
```sql
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  course_id INT,
  department_id INT,
  created_by INT,
  batch_id VARCHAR(255),
  generation_method VARCHAR(255),
  generation_parameters JSON,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Group Members Table
```sql
CREATE TABLE group_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT NOT NULL,
  student_id INT NOT NULL,
  role VARCHAR(255) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Admin Authentication
All admin endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- User must have `isAdmin: true` in their JWT token

### Lecturer Management
- `GET /api/admin/lecturers` - Get all lecturers
- `POST /api/admin/lecturers` - Create new lecturer
- `PUT /api/admin/lecturers/:id` - Update lecturer
- `DELETE /api/admin/lecturers/:id` - Delete lecturer

### Student Management
- `GET /api/admin/students` - Get all students
- `POST /api/admin/students` - Create new student
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student

### Group Management
- `GET /api/admin/groups` - Get all groups
- `DELETE /api/admin/groups/:id` - Delete group

### System Statistics
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/departments` - Get all departments

## Frontend Access

### Admin Panel URL
```
http://localhost:3000/admin
```

### Features
1. **Dashboard Tab**: Shows system statistics
2. **Lecturers Tab**: Manage lecturer accounts
3. **Students Tab**: Manage student records
4. **Groups Tab**: View and manage groups

### Admin Navigation
The admin panel is accessible from the sidebar (only visible to admin users) and includes:
- Search and filter functionality
- Add/Edit/Delete operations
- Responsive design for mobile devices

## Security Features

### Role-Based Access Control
- Only users with `role = 'admin'` can access admin endpoints
- JWT tokens include user role information
- Admin middleware validates permissions

### Data Validation
- Input validation on all forms
- Duplicate email/index number prevention
- Referential integrity checks before deletion

### Safe Deletion
- Lecturers cannot be deleted if they have groups
- Students cannot be deleted if they are in groups
- Groups are deleted with their members

## Usage Examples

### Creating a Lecturer
```javascript
const lecturerData = {
  email: "lecturer@university.edu",
  firstName: "John",
  lastName: "Doe",
  departmentId: 1,
  password: "securepassword123"
};

await axios.post('/api/admin/lecturers', lecturerData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Creating a Student
```javascript
const studentData = {
  indexNumber: "2023001",
  firstName: "Jane",
  lastName: "Smith",
  gender: "Female",
  email: "jane.smith@student.edu"
};

await axios.post('/api/admin/students', studentData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Ensure user has admin role
   - Check JWT token validity
   - Verify token includes role information

2. **Cannot Delete User/Student**
   - Check if user has associated groups
   - Remove all associations first

3. **Duplicate Entry Errors**
   - Email addresses must be unique for users
   - Index numbers must be unique for students

### Database Checks
```sql
-- Check user roles
SELECT id, email, role, status FROM users WHERE role = 'admin';

-- Check user associations
SELECT u.id, u.email, COUNT(g.id) as group_count 
FROM users u 
LEFT JOIN groups g ON u.id = g.created_by 
WHERE u.role = 'lecturer' 
GROUP BY u.id;

-- Check student associations
SELECT s.id, s.index_number, COUNT(gm.group_id) as group_count 
FROM students s 
LEFT JOIN group_members gm ON s.id = gm.student_id 
GROUP BY s.id;
```

## Support
For technical support or questions about the admin functionality, please refer to the project documentation or contact the development team.
