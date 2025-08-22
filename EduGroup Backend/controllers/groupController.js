// controllers/groupController.js
const db = require('../models/db');
const { v4: uuidv4 } = require("uuid");

// ✅ Create a new group
exports.createGroup = (req, res) => {
  const userId = req.user.id; // logged-in lecturer
  const {
    name,
    description,
    courseId,   // ✅ now expecting courseId instead of code+name
    subject,
    academic_year,
    department_id,
    generation_method,
    generation_parameters
  } = req.body;

  const batchId = uuidv4();

  const query = `
    INSERT INTO groups 
    (name, description, course_id, subject, academic_year, department_id, generation_method, generation_parameters, batch_id, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      name,
      description,
      courseId,
      subject,
      academic_year,
      department_id,
      generation_method,
      JSON.stringify(generation_parameters || {}),
      batchId,
      userId
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating group:", err);
        return res.status(500).json({ message: "Error creating group" });
      }
      res.status(201).json({ message: "Group created successfully", groupId: result.insertId });
    }
  );
};

exports.getRecentGroups = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT g.id, g.name AS group_name, g.created_at, g.status,
           c.course_name,
           COUNT(gm.student_id) AS student_count
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN students s ON gm.student_id = s.id
    LEFT JOIN courses c ON g.course_id = c.id   -- ✅ courseId now used
    WHERE g.created_by = ?
    GROUP BY g.id, g.name, g.created_at, g.status, c.course_name
    ORDER BY g.created_at DESC
    LIMIT 5
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching recent groups:", err);
      return res.status(500).json({ message: "Error fetching groups" });
    }
    res.json(results);
  });
};


// ✅ Generate groups automatically
exports.generateGroups = (req, res) => {
  const userId = req.user.id;
  const {
    courseId,            // ✅ now required
    studentsPerGroup,
    numberOfGroups,
    genderBalance,
    academicBalance,
    distributionMethod
  } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: "Course is required" });
  }

  const fetchStudentsQuery = `
    SELECT s.id, s.first_name, s.last_name, s.gender
    FROM student_courses sc
    JOIN students s ON sc.student_id = s.id
    WHERE sc.course_id = ?
  `;

  db.query(fetchStudentsQuery, [courseId], (err, students) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ message: "Error fetching students" });
    }

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this course" });
    }

    let groupSize;
    if (studentsPerGroup) {
      groupSize = studentsPerGroup;
    } else if (numberOfGroups) {
      groupSize = Math.ceil(students.length / numberOfGroups);
    } else {
      return res.status(400).json({ message: "Either studentsPerGroup or numberOfGroups must be provided" });
    }

    students.sort(() => Math.random() - 0.5);

    const batchId = uuidv4();

    const groups = [];
    for (let i = 0; i < students.length; i += groupSize) {
      groups.push(students.slice(i, i + groupSize));
    }

    const groupInserts = groups.map((grp, index) => {
      return new Promise((resolve, reject) => {
        const groupName = `Group ${index + 1}`;
        const groupQuery = `
          INSERT INTO \`groups\` (name, course_id, department_id, created_by, batch_id, generation_method, generation_parameters)
          VALUES (?, ?, (SELECT department_id FROM users WHERE id = ?), ?, ?, ?, ?)
        `;
        const params = [
          groupName,
          courseId,   // ✅ now used correctly
          userId,
          userId,
          batchId,
          "Algorithm",
          JSON.stringify({ studentsPerGroup, numberOfGroups, genderBalance, academicBalance, distributionMethod })
        ];

        db.query(groupQuery, params, (err, result) => {
          if (err) return reject(err);
          const groupId = result.insertId;

          const memberValues = grp.map(s => [groupId, s.id, "member"]);
          if (memberValues.length > 0) {
            const memberQuery = `
              INSERT INTO group_members (group_id, student_id, role)
              VALUES ?
            `;
            db.query(memberQuery, [memberValues], (err2) => {
              if (err2) return reject(err2);
              resolve({ id: groupId, name: groupName, members: grp });
            });
          } else {
            resolve({ id: groupId, name: groupName, members: [] });
          }
        });
      });
    });

    Promise.all(groupInserts)
      .then((createdGroups) => {
        res.json({ batchId, groups: createdGroups });
      })
      .catch((error) => {
        console.error("Error creating groups:", error);
        res.status(500).json({ message: "Error generating groups" });
      });
  });
};
