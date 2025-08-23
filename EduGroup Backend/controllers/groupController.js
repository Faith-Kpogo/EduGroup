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
    SELECT 
      g.batch_id,
      c.course_name,
      g.created_at,
      g.status,
      COUNT(DISTINCT g.id) AS total_groups,
      COUNT(DISTINCT gm.student_id) AS total_students
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN courses c ON g.course_id = c.id
    WHERE g.created_by = ?
    GROUP BY g.batch_id, c.course_name, g.created_at, g.status
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
  SELECT s.id, s.index_number, s.first_name, s.last_name, s.gender
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

// ✅ Fetch all groups in a batch
exports.getGroupsByBatch = (req, res) => {
  const userId = req.user.id;
  const { batchId } = req.params;

  const query = `
    SELECT 
      g.id AS group_id,
      g.name AS group_name,
      g.batch_id,
      c.course_name,
      s.index_number,
      s.first_name,
      s.last_name,
      s.gender
    FROM \`groups\` g
    LEFT JOIN courses c ON g.course_id = c.id
    LEFT JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN students s ON gm.student_id = s.id
    WHERE g.created_by = ? AND g.batch_id = ?
    ORDER BY g.id, s.index_number
  `;

  db.query(query, [userId, batchId], (err, results) => {
    if (err) {
      console.error("Error fetching groups by batch:", err);
      return res.status(500).json({ message: "Error fetching groups" });
    }

    // ✅ Restructure into groups with member lists
    const grouped = {};
    results.forEach(row => {
      if (!grouped[row.group_id]) {
        grouped[row.group_id] = {
          id: row.group_id,
          name: row.group_name,
          course: row.course_name,
          members: []
        };
      }
      if (row.index_number) {
        grouped[row.group_id].members.push({
          index_number: row.index_number,
          name: `${row.first_name} ${row.last_name}`,
          gender: row.gender
        });
      }
    });

    res.json(Object.values(grouped));
  });
};


exports.getGroupDetails = (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id; // ensure lecturer only sees their groups

  const groupQuery = `
    SELECT g.id, g.name, g.created_at, g.status, g.batch_id,
           c.course_name, g.created_by
    FROM \`groups\` g
    JOIN courses c ON g.course_id = c.id
    WHERE g.id = ? AND g.created_by = ?
  `;

  db.query(groupQuery, [groupId, userId], (err, groupResults) => {
    if (err) {
      console.error("Error fetching group details:", err);
      return res.status(500).json({ message: "Error fetching group details" });
    }

    if (groupResults.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    const group = groupResults[0];

    const studentsQuery = `
      SELECT s.id, s.index_number, s.gender
      FROM group_members gm
      JOIN students s ON gm.student_id = s.id
      WHERE gm.group_id = ?
    `;

    db.query(studentsQuery, [groupId], (err2, students) => {
      if (err2) {
        console.error("Error fetching group students:", err2);
        return res.status(500).json({ message: "Error fetching students" });
      }

      const performance = {
        high: Math.floor(students.length * 0.2),
        average: Math.floor(students.length * 0.6),
        low: Math.floor(students.length * 0.2),
      };

      res.json({
        ...group,
        students,
        performance,
      });
    });
  });
};


// ✅ Get all groups history for lecturer
exports.getGroupsHistory = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      g.id,
      g.name AS group_name,
      g.batch_id,
      g.created_at,
      g.status,
      c.course_name,
      COUNT(gm.student_id) AS student_count
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN courses c ON g.course_id = c.id
    WHERE g.created_by = ?
    GROUP BY g.id, g.name, g.batch_id, g.created_at, g.status, c.course_name
    ORDER BY g.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching groups history:", err);
      return res.status(500).json({ message: "Error fetching groups history" });
    }
    res.json(results);
  });
};
