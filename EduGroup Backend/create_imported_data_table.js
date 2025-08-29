// Database migration script to create imported_data table
const db = require('./models/db');

console.log('Starting database migration for imported data table...');

// Create imported_data table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS imported_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255),
    course_id INT,
    data_json JSON NOT NULL,
    imported_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE SET NULL
  )
`;

db.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('❌ Error creating imported_data table:', err.message);
    process.exit(1);
  }
  
  console.log('✅ imported_data table created successfully');
  
  // Add indexes for better performance
  const addIndexesQuery = `
    ALTER TABLE imported_data 
    ADD INDEX idx_course_id (course_id),
    ADD INDEX idx_imported_by (imported_by),
    ADD INDEX idx_created_at (created_at)
  `;
  
  db.query(addIndexesQuery, (err2, result2) => {
    if (err2) {
      console.log('⚠️ Warning: Could not add indexes:', err2.message);
    } else {
      console.log('✅ Indexes added successfully');
    }
    
    console.log('✅ Database migration completed!');
    process.exit(0);
  });
});
