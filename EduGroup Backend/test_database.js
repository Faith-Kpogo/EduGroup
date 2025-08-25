// Database test script - run this to check your database
const db = require('./models/db');

console.log('Testing database connection...');

// Test 1: Basic connection
db.query('SELECT 1 as test', (err, results) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Database connected successfully!');
  
  // Test 2: Show all tables
  db.query('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error('❌ Error showing tables:', err.message);
      return;
    }
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Test 3: Check users table structure
    db.query('DESCRIBE users', (err, userColumns) => {
      if (err) {
        console.error('❌ Error describing users table:', err.message);
        return;
      }
      console.log('\n👥 Users table structure:');
      userColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
      });
      
      // Test 4: Check if there are any users
      db.query('SELECT COUNT(*) as count FROM users', (err, userCount) => {
        if (err) {
          console.error('❌ Error counting users:', err.message);
          return;
        }
        console.log(`\n👤 Total users: ${userCount[0].count}`);
        
        // Test 5: Check users with lecturer role
        db.query("SELECT COUNT(*) as count FROM users WHERE role = 'lecturer'", (err, lecturerCount) => {
          if (err) {
            console.error('❌ Error counting lecturers:', err.message);
            return;
          }
          console.log(`👨‍🏫 Total lecturers: ${lecturerCount[0].count}`);
          
          // Test 6: Check students table
          db.query('SELECT COUNT(*) as count FROM students', (err, studentCount) => {
            if (err) {
              console.error('❌ Error counting students:', err.message);
              return;
            }
            console.log(`🎓 Total students: ${studentCount[0].count}`);
            
            // Test 7: Check departments
            db.query('SELECT COUNT(*) as count FROM departments', (err, deptCount) => {
              if (err) {
                console.error('❌ Error counting departments:', err.message);
                return;
              }
              console.log(`🏢 Total departments: ${deptCount[0].count}`);
              
              // Test 8: Show sample data
              console.log('\n📊 Sample data:');
              
              // Sample users
              db.query('SELECT id, email, first_name, last_name, role FROM users LIMIT 3', (err, users) => {
                if (!err && users.length > 0) {
                  console.log('\n👥 Sample users:');
                  users.forEach(user => {
                    console.log(`  - ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
                  });
                }
                
                // Sample students
                db.query('SELECT id, index_number, first_name, last_name FROM students LIMIT 3', (err, students) => {
                  if (!err && students.length > 0) {
                    console.log('\n🎓 Sample students:');
                    students.forEach(student => {
                      console.log(`  - ${student.first_name} ${student.last_name} (${student.index_number})`);
                    });
                  }
                  
                  // Sample departments
                  db.query('SELECT id, name FROM departments LIMIT 3', (err, departments) => {
                    if (!err && departments.length > 0) {
                      console.log('\n🏢 Sample departments:');
                      departments.forEach(dept => {
                        console.log(`  - ${dept.name}`);
                      });
                    }
                    
                    console.log('\n✅ Database test completed!');
                    process.exit(0);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
