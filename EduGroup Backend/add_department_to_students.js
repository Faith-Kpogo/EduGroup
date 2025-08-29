// Database migration script to add department_id to students table
const db = require('./models/db');

console.log('Starting database migration...');

// Check if department_id column exists in students table
db.query('DESCRIBE students', (err, columns) => {
  if (err) {
    console.error('❌ Error describing students table:', err.message);
    process.exit(1);
  }

  const hasDepartmentId = columns.some(col => col.Field === 'department_id');
  
  if (hasDepartmentId) {
    console.log('✅ department_id column already exists in students table');
    process.exit(0);
  }

  console.log('📝 Adding department_id column to students table...');

  // Add department_id column
  const alterQuery = `
    ALTER TABLE students 
    ADD COLUMN department_id INT NULL DEFAULT NULL,
    ADD CONSTRAINT fk_students_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) 
    ON DELETE SET NULL
  `;

  db.query(alterQuery, (err, result) => {
    if (err) {
      console.error('❌ Error adding department_id column:', err.message);
      
      // Try without foreign key constraint if it fails
      console.log('🔄 Trying without foreign key constraint...');
      const simpleAlterQuery = 'ALTER TABLE students ADD COLUMN department_id INT NULL DEFAULT NULL';
      
      db.query(simpleAlterQuery, (err2, result2) => {
        if (err2) {
          console.error('❌ Error adding department_id column (simple):', err2.message);
          process.exit(1);
        }
        
        console.log('✅ department_id column added successfully (without foreign key constraint)');
        process.exit(0);
      });
    } else {
      console.log('✅ department_id column added successfully with foreign key constraint');
      process.exit(0);
    }
  });
});
