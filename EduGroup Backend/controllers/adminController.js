// controllers/adminController.js
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require("uuid");

// Helper function to normalize level strings like "Level 300" → 300
function normalizeLevel(level) {
  if (!level) return null;
  const match = level.toString().match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// ✅ Get all lecturers (users with role 'teacher')
exports.getAllLecturers = (req, res) => {
  console.log('getAllLecturers called');
  
  // Check if the users table has the expected structure
  const query = `
    SELECT 
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.department_id,
      COALESCE(d.name, 'No Department') AS department_name,
      u.created_at,
      COALESCE(u.account_active, 1) as status
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.role = 'teacher'
    ORDER BY u.created_at DESC
  `;

  console.log('Executing query:', query);

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching lecturers:", err);
      // Try a simpler query to see what columns exist
      const simpleQuery = `SELECT * FROM users LIMIT 1`;
      db.query(simpleQuery, (err2, sampleResults) => {
        if (err2) {
          console.error("Error with simple query:", err2);
          return res.status(500).json({ 
            message: "Error fetching lecturers", 
            error: err.message,
            suggestion: "Check if users table exists and has correct structure"
          });
        }
        console.log("Sample user record:", sampleResults[0]);
        return res.status(500).json({ 
          message: "Error fetching lecturers", 
          error: err.message,
          tableStructure: sampleResults[0]
        });
      });
      return;
    }
    console.log('Query successful, results:', results);
    res.json(results);
  });
};

// ✅ Create new lecturer account
exports.createLecturer = async (req, res) => {
  const { email, firstName, lastName, departmentId, password } = req.body;

  if (!email || !firstName || !lastName || !departmentId || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const checkEmailQuery = `SELECT id FROM users WHERE email = ?`;
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        console.error("Error checking email:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create lecturer account
      const createQuery = `
        INSERT INTO users (email, first_name, last_name, department_id, password_hash, role, account_active)
        VALUES (?, ?, ?, ?, ?, 'teacher', 1)
      `;

      db.query(createQuery, [email, firstName, lastName, departmentId, hashedPassword], (err2, result) => {
        if (err2) {
          console.error("Error creating lecturer:", err2);
          return res.status(500).json({ message: "Failed to create lecturer account" });
        }

        res.status(201).json({ 
          message: "Lecturer account created successfully",
          lecturerId: result.insertId 
        });
      });
    });
  } catch (error) {
    console.error("Error in createLecturer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update lecturer account
exports.updateLecturer = (req, res) => {
  const { lecturerId } = req.params;
  const { email, firstName, lastName, departmentId, status } = req.body;

  if (!email || !firstName || !lastName || !departmentId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const updateQuery = `
    UPDATE users 
    SET email = ?, first_name = ?, last_name = ?, department_id = ?, status = ?
    WHERE id = ? AND role = 'teacher'
  `;

  db.query(updateQuery, [email, firstName, lastName, departmentId, status, lecturerId], (err, result) => {
    if (err) {
      console.error("Error updating lecturer:", err);
      return res.status(500).json({ message: "Failed to update lecturer" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    res.json({ message: "Lecturer updated successfully" });
  });
};

// ✅ Delete lecturer account
exports.deleteLecturer = (req, res) => {
  const { lecturerId } = req.params;

  // First check if lecturer has any groups
  const checkGroupsQuery = `
    SELECT COUNT(*) as groupCount 
    FROM \`groups\` 
    WHERE created_by = ?
  `;

  db.query(checkGroupsQuery, [lecturerId], (err, results) => {
    if (err) {
      console.error("Error checking lecturer groups:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results[0].groupCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete lecturer with existing groups. Please delete their groups first." 
      });
    }

    // Delete lecturer account
    const deleteQuery = `DELETE FROM users WHERE id = ? AND role = 'teacher'`;
    
    db.query(deleteQuery, [lecturerId], (err2, result) => {
      if (err2) {
        console.error("Error deleting lecturer:", err2);
        return res.status(500).json({ message: "Failed to delete lecturer" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lecturer not found" });
      }

      res.json({ message: "Lecturer deleted successfully" });
    });
  });
};

// ✅ Get all students
exports.getAllStudents = (req, res) => {
  const query = `
    SELECT 
      s.id,
      s.index_number,
      s.first_name,
      s.last_name,
      s.gender,
      s.email,
      s.department_id,
      COALESCE(d.name, 'No Department') AS department_name,
      s.created_at
    FROM students s
    LEFT JOIN departments d ON s.department_id = d.id
    ORDER BY s.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ message: "Error fetching students" });
    }
    res.json(results);
  });
};

// ✅ Create new student
exports.createStudent = (req, res) => {
  const { indexNumber, firstName, lastName, gender, level, email, departmentId } = req.body;

  if (!indexNumber || !firstName || !lastName || !gender || !level) {
    return res.status(400).json({ message: "Index number, first name, last name, gender, and level are required" });
  }

  // ✅ Ensure level is numeric (convert "Level 100" → 100)
  let numericLevel = parseInt(level.toString().replace(/\D/g, ""), 10);
  if (isNaN(numericLevel)) {
    return res.status(400).json({ message: "Invalid level format" });
  }

  // Check if index number already exists
  const checkIndexQuery = `SELECT id FROM students WHERE index_number = ?`;
  db.query(checkIndexQuery, [indexNumber], (err, results) => {
    if (err) {
      console.error("Error checking index number:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Index number already exists" });
    }

    // Create student
    const createQuery = `
      INSERT INTO students (index_number, first_name, last_name, gender, level, email, department_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      createQuery,
      [indexNumber, firstName, lastName, gender, numericLevel, email || null, departmentId || null],
      (err2, result) => {
        if (err2) {
          console.error("Error creating student:", err2);
          return res.status(500).json({ message: "Failed to create student" });
        }

        res.status(201).json({
          message: "Student created successfully",
          studentId: result.insertId
        });
      }
    );
  });
};


// ✅ Bulk create students
exports.bulkCreateStudents = (req, res) => {
  const { students } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "Students array is required and must not be empty" });
  }

  const validStudents = [];
  const errors = [];

  students.forEach((student, index) => {
    const { indexNumber, firstName, lastName, gender, level, email, department } = student;

    const numericLevel = normalizeLevel(level);

    if (!indexNumber || !firstName || !lastName || !gender || !numericLevel) {
      errors.push(`Row ${index + 1}: Missing or invalid fields (Index Number, First Name, Last Name, Gender, Level)`);
      return;
    }

    // Validate gender
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      errors.push(`Row ${index + 1}: Invalid gender. Must be Male, Female, or Other`);
      return;
    }

    validStudents.push({
      indexNumber: indexNumber.toString().trim(),
      firstName: firstName.toString().trim(),
      lastName: lastName.toString().trim(),
      gender: gender.toString().trim(),
      level: numericLevel,
      email: email ? email.toString().trim() : null,
      department: department ? department.toString().trim() : null
    });
  });

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: "Validation errors found", 
      errors 
    });
  }

  // Check for duplicate index numbers
  const indexNumbers = validStudents.map(s => s.indexNumber);
  const checkDuplicatesQuery = `SELECT index_number FROM students WHERE index_number IN (${indexNumbers.map(() => '?').join(',')})`;

  db.query(checkDuplicatesQuery, indexNumbers, (err, results) => {
    if (err) {
      console.error("Error checking duplicate index numbers:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      const duplicates = results.map(r => r.index_number);
      return res.status(400).json({ 
        message: "Duplicate index numbers found", 
        duplicates 
      });
    }

    // Check departments
    const departments = validStudents.filter(s => s.department).map(s => s.department);
    if (departments.length > 0) {
      const checkDeptsQuery = `SELECT id, name FROM departments WHERE name IN (${departments.map(() => '?').join(',')})`;

      db.query(checkDeptsQuery, departments, (err2, deptResults) => {
        if (err2) {
          console.error("Error checking departments:", err2);
          return res.status(500).json({ message: "Server error" });
        }

        const deptMap = {};
        deptResults.forEach(dept => {
          deptMap[dept.name] = dept.id;
        });

        createStudentsWithDepts(validStudents, deptMap, res);
      });
    } else {
      createStudentsWithDepts(validStudents, {}, res);
    }
  });
};


// Helper function to create students
const createStudentsWithDepts = (students, deptMap, res) => {
  let uploadedCount = 0;
  let errorCount = 0;
  const errors = [];

  const createStudent = (index) => {
    if (index >= students.length) {
      // All students processed
      res.status(201).json({ 
        message: "Bulk upload completed",
        uploadedCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined
      });
      return;
    }

    const student = students[index];
    const departmentId = student.department && deptMap[student.department] ? deptMap[student.department] : null;

    const createQuery = `
      INSERT INTO students (index_number, first_name, last_name, gender, level, email, department_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(createQuery, [
      student.indexNumber, 
      student.firstName, 
      student.lastName, 
      student.gender, 
      student.level, 
      student.email, 
      departmentId
    ], (err, result) => {
      if (err) {
        console.error(`Error creating student ${student.indexNumber}:`, err);
        errorCount++;
        errors.push(`Row ${index + 1}: Failed to create student - ${err.message}`);
      } else {
        uploadedCount++;
      }

      // Process next student
      createStudent(index + 1);
    });
  };

  // Start processing students
  createStudent(0);
};

// ✅ Update student
exports.updateStudent = (req, res) => {
  const { studentId } = req.params;
  const { indexNumber, firstName, lastName, gender, level, email, departmentId } = req.body;

  const numericLevel = normalizeLevel(level);

  if (!indexNumber || !firstName || !lastName || !gender || !numericLevel) {
    return res.status(400).json({ message: "Index number, first name, last name, gender, and level are required" });
  }

  // Check if index number already exists for another student
  const checkIndexQuery = `SELECT id FROM students WHERE index_number = ? AND id != ?`;
  db.query(checkIndexQuery, [indexNumber, studentId], (err, results) => {
    if (err) {
      console.error("Error checking index number:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Index number already exists" });
    }

    const updateQuery = `
      UPDATE students 
      SET index_number = ?, first_name = ?, last_name = ?, gender = ?, level = ?, email = ?, department_id = ?
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [indexNumber, firstName, lastName, gender, numericLevel, email, departmentId || null, studentId],
      (err2, result) => {
        if (err2) {
          console.error("Error updating student:", err2);
          return res.status(500).json({ message: "Failed to update student" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student updated successfully" });
      }
    );
  });
};



// ✅ Delete student
exports.deleteStudent = (req, res) => {
  const { studentId } = req.params;

  // Step 1: Remove student from any groups
  const removeFromGroupsQuery = `DELETE FROM group_members WHERE student_id = ?`;
  db.query(removeFromGroupsQuery, [studentId], (err) => {
    if (err) {
      console.error("Error removing student from groups:", err);
      return res.status(500).json({ message: "Failed to remove student from groups" });
    }

    // Step 2: Delete student record
    const deleteQuery = `DELETE FROM students WHERE id = ?`;
    db.query(deleteQuery, [studentId], (err2, result) => {
      if (err2) {
        console.error("Error deleting student:", err2);
        return res.status(500).json({ message: "Failed to delete student" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    });
  });
};


// ✅ Get all groups (admin view)
exports.getAllGroups = (req, res) => {
  const query = `
    SELECT 
      g.id,
      g.name,
      g.batch_id,
      g.created_at,
      COALESCE(g.status, 'active') as status,
      COALESCE(c.course_name, 'No Course') as course_name,
      u.first_name as lecturer_first_name,
      u.last_name as lecturer_last_name,
      COUNT(gm.student_id) as student_count
    FROM \`groups\` g
    LEFT JOIN courses c ON g.course_id = c.id
    LEFT JOIN users u ON g.created_by = u.id
    LEFT JOIN group_members gm ON g.id = gm.group_id
    GROUP BY g.id, g.name, g.batch_id, g.created_at, g.status, c.course_name, u.first_name, u.last_name
    ORDER BY g.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ message: "Error fetching groups" });
    }
    res.json(results);
  });
};

// ✅ Delete group (admin)
exports.deleteGroup = (req, res) => {
  const { groupId } = req.params;

  // First delete group members
  const deleteMembers = `DELETE FROM group_members WHERE group_id = ?`;

  db.query(deleteMembers, [groupId], (err) => {
    if (err) {
      console.error("Error deleting group members:", err);
      return res.status(500).json({ message: "Error deleting group members" });
    }

    // Now delete group
    const deleteGroupQuery = `DELETE FROM \`groups\` WHERE id = ?`;
    db.query(deleteGroupQuery, [groupId], (err2, result) => {
      if (err2) {
        console.error("Error deleting group:", err2);
        return res.status(500).json({ message: "Error deleting group" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json({ message: "Group deleted successfully" });
    });
  });
};

// ✅ Get system statistics
exports.getSystemStats = (req, res) => {
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_lecturers,
      (SELECT COUNT(*) FROM students) as total_students,
      (SELECT COUNT(*) FROM \`groups\`) as total_groups,
      (SELECT COUNT(*) FROM courses) as total_courses,
      (SELECT COUNT(*) FROM departments) as total_departments,
      (SELECT COUNT(*) FROM imported_data) as total_imports,
      (SELECT COALESCE(SUM(JSON_LENGTH(data_json)), 0) FROM imported_data) as total_imported_records
  `;

  db.query(statsQuery, (err, results) => {
    if (err) {
      console.error("Error fetching system stats:", err);
      // Try to get basic counts individually
      const basicStats = {};
      
      // Count lecturers
      db.query("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'", (err1, res1) => {
        basicStats.total_lecturers = res1[0]?.count || 0;
        
        // Count students
        db.query("SELECT COUNT(*) as count FROM students", (err2, res2) => {
          basicStats.total_students = res2[0]?.count || 0;
          
          // Count groups
          db.query("SELECT COUNT(*) as count FROM `groups`", (err3, res3) => {
            basicStats.total_groups = res3[0]?.count || 0;
            
            // Count courses
            db.query("SELECT COUNT(*) as count FROM courses", (err4, res4) => {
              basicStats.total_courses = res4[0]?.count || 0;
              
              // Count departments
              db.query("SELECT COUNT(*) as count FROM departments", (err5, res5) => {
                basicStats.total_departments = res5[0]?.count || 0;
                
                console.log("Basic stats collected:", basicStats);
                res.json(basicStats);
              });
            });
          });
        });
      });
      return;
    }
    res.json(results[0]);
  });
};

// ✅ Get all departments
exports.getAllDepartments = (req, res) => {
  const query = `SELECT * FROM departments ORDER BY name`;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching departments:", err);
      return res.status(500).json({ message: "Error fetching departments" });
    }
    res.json(results);
  });
};

// ✅ Get all imported data
exports.getAllImportedData = (req, res) => {
  const query = `
    SELECT 
      imported_data.id, 
      imported_data.file_name, 
      imported_data.course_name, 
      imported_data.course_id, 
      imported_data.imported_by,
      imported_data.created_at,
      JSON_LENGTH(imported_data.data_json) as record_count,
      u.first_name,
      u.last_name
    FROM imported_data
    LEFT JOIN users u ON imported_data.imported_by = u.id
    ORDER BY imported_data.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching imported data:", err);
      return res.status(500).json({ message: "Error fetching imported data" });
    }
    res.json(results);
  });
};

// ✅ Store imported data
exports.storeImportedData = (req, res) => {
  const { fileName, courseName, courseId, data, userId } = req.body;

  if (!fileName || !data) {
    return res.status(400).json({ message: "File name and data are required" });
  }

  const insertQuery = `
    INSERT INTO imported_data (file_name, course_name, course_id, data_json, imported_by)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [fileName, courseName || null, courseId || null, JSON.stringify(data), userId], (err, result) => {
    if (err) {
      console.error("Error storing imported data:", err);
      return res.status(500).json({ message: "Failed to store imported data" });
    }

    res.status(201).json({ 
      message: "Imported data stored successfully",
      importId: result.insertId 
    });
  });
};

// ✅ Delete imported data
exports.deleteImportedData = (req, res) => {
  const { importId } = req.params;

  const deleteQuery = `DELETE FROM imported_data WHERE id = ?`;
  
  db.query(deleteQuery, [importId], (err, result) => {
    if (err) {
      console.error("Error deleting imported data:", err);
      return res.status(500).json({ message: "Failed to delete imported data" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Imported data not found" });
    }

    res.json({ message: "Imported data deleted successfully" });
  });
};

// ✅ Create sample data for testing
exports.createSampleData = async (req, res) => {
  try {
    console.log('Creating sample data...');
    
    // Create sample departments
    const deptQuery = `INSERT IGNORE INTO departments (name) VALUES 
      ('Computer Science'), 
      ('Mathematics'), 
      ('Physics'), 
      ('Engineering')`;
    
    db.query(deptQuery, (err, deptResult) => {
      if (err) {
        console.error('Error creating departments:', err);
        return res.status(500).json({ message: 'Error creating departments' });
      }
      
      // Create sample lecturers
      const lecturerQuery = `INSERT IGNORE INTO users (email, first_name, last_name, password_hash, role, account_active) VALUES 
        ('john.doe@university.edu', 'John', 'Doe', ?, 'teacher', 1),
        ('jane.smith@university.edu', 'Jane', 'Smith', ?, 'teacher', 1),
        ('bob.wilson@university.edu', 'Bob', 'Wilson', ?, 'teacher', 1)`;
      
      const hashedPassword = bcrypt.hashSync('password123', 10);
      
      db.query(lecturerQuery, [hashedPassword, hashedPassword, hashedPassword], (err2, lecturerResult) => {
        if (err2) {
          console.error('Error creating lecturers:', err2);
          return res.status(500).json({ message: 'Error creating lecturers' });
        }
        
        // Create sample students
        const studentQuery = `INSERT IGNORE INTO students (index_number, first_name, last_name, gender, email, status) VALUES 
          ('2023001', 'Alice', 'Johnson', 'Female', 'alice.johnson@student.edu', 'active'),
          ('2023002', 'Charlie', 'Brown', 'Male', 'charlie.brown@student.edu', 'active'),
          ('2023003', 'Diana', 'Prince', 'Female', 'diana.prince@student.edu', 'active'),
          ('2023004', 'Edward', 'Norton', 'Male', 'edward.norton@student.edu', 'active')`;
        
        db.query(studentQuery, (err3, studentResult) => {
          if (err3) {
            console.error('Error creating students:', err3);
            return res.status(500).json({ message: 'Error creating students' });
          }
          
          res.json({ 
            message: 'Sample data created successfully',
            departments: deptResult.affectedRows,
            students: studentResult.affectedRows
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in createSampleData:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
