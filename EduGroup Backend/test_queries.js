const db = require('./models/db');

console.log('Testing admin controller queries...');

// Test getAllLecturers query
const lecturersQuery = `
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

console.log('Testing lecturers query...');
db.query(lecturersQuery, (err, results) => {
  if (err) {
    console.error('❌ Error in lecturers query:', err);
  } else {
    console.log('✅ Lecturers query successful!');
    console.log('Results:', results);
  }
  
  // Test getAllStudents query
  const studentsQuery = `
    SELECT 
      s.id,
      s.index_number,
      s.first_name,
      s.last_name,
      s.gender,
      s.email,
      s.created_at
    FROM students s
    ORDER BY s.created_at DESC
  `;
  
  console.log('\nTesting students query...');
  db.query(studentsQuery, (err2, results2) => {
    if (err2) {
      console.error('❌ Error in students query:', err2);
    } else {
      console.log('✅ Students query successful!');
      console.log('Results:', results2);
    }
    
    // Test getSystemStats query
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_lecturers,
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM \`groups\`) as total_groups,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM departments) as total_departments
    `;
    
    console.log('\nTesting stats query...');
    db.query(statsQuery, (err3, results3) => {
      if (err3) {
        console.error('❌ Error in stats query:', err3);
      } else {
        console.log('✅ Stats query successful!');
        console.log('Results:', results3);
      }
      
      console.log('\n✅ All queries tested!');
      process.exit(0);
    });
  });
});


