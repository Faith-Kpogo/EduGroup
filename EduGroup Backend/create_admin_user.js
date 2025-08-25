// Script to create admin user in existing database
const db = require('./models/db');
const bcrypt = require('bcryptjs');

console.log('Creating admin user...');

// Check if admin user already exists
const checkQuery = "SELECT id FROM users WHERE email = 'admin@edugroup.com'";

db.query(checkQuery, async (err, results) => {
  if (err) {
    console.error('❌ Error checking for existing admin:', err.message);
    return;
  }
  
  if (results.length > 0) {
    console.log('✅ Admin user already exists!');
    process.exit(0);
  }
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const insertQuery = `
    INSERT INTO users (email, first_name, last_name, password_hash, role, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const adminData = [
    'admin@edugroup.com',
    'Admin',
    'User',
    hashedPassword,
    'admin',
    'active'
  ];
  
  db.query(insertQuery, adminData, (err, result) => {
    if (err) {
      console.error('❌ Error creating admin user:', err.message);
      
      // Try to see what columns exist in users table
      db.query('DESCRIBE users', (err2, columns) => {
        if (err2) {
          console.error('❌ Error describing users table:', err2.message);
        } else {
          console.log('\n📋 Users table columns:');
          columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type}`);
          });
        }
      });
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@edugroup.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', result.insertId);
    
    process.exit(0);
  });
});
