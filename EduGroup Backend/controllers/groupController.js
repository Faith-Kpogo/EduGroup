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
      MIN(g.created_at) AS created_at,
      c.course_name,
      COUNT(DISTINCT g.id) AS total_groups,
      COUNT(DISTINCT gm.student_id) AS total_students
    FROM \`groups\` g
    LEFT JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN courses c ON g.course_id = c.id
    WHERE g.created_by = ?
    GROUP BY g.batch_id, c.course_name
    ORDER BY created_at DESC
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
// ✅ Generate groups automatically
exports.generateGroups = (req, res) => {
  const userId = req.user.id;
  const {
    courseId,
    studentsPerGroup,
    numberOfGroups,
    genderBalance,
    academicBalance,
    distributionMethod,
    keepTogether // ✅ added
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

    // Shuffle students
    students.sort(() => Math.random() - 0.5);

    // ✅ Handle keepTogether - distribute students while keeping specified ones together
    let groupedStudents = [];
    let remainingStudents = [...students];
    
    // Calculate how many groups we'll have and ensure proper group sizing
    let totalGroups;
    if (studentsPerGroup) {
      totalGroups = Math.ceil(students.length / studentsPerGroup);
      // Ensure groupSize is not exceeded
      groupSize = Math.min(groupSize, studentsPerGroup);
    } else if (numberOfGroups) {
      totalGroups = numberOfGroups;
      groupSize = Math.ceil(students.length / numberOfGroups);
    }
    
    // Initialize empty groups
    for (let i = 0; i < totalGroups; i++) {
      groupedStudents.push([]);
    }
    
    if (Array.isArray(keepTogether) && keepTogether.length > 0) {
      // Match students by index_number or name
      const matched = remainingStudents.filter(s =>
        keepTogether.includes(s.index_number) || 
        keepTogether.includes(`${s.first_name} ${s.last_name}`)
      );

      if (matched.length > 0) {
        // Check if keepTogether students exceed group size
        if (matched.length > groupSize) {
          return res.status(400).json({ 
            message: `Cannot keep ${matched.length} students together. Maximum group size is ${groupSize}.` 
          });
        }
        
        // Find the first group that can accommodate all keepTogether students
        let targetGroupIndex = 0;
        for (let i = 0; i < totalGroups; i++) {
          if (groupedStudents[i].length + matched.length <= groupSize) {
            targetGroupIndex = i;
            break;
          }
        }
        
        // Place the keepTogether students in the target group
        groupedStudents[targetGroupIndex] = [...matched];
        // Remove them from remaining pool
        remainingStudents = remainingStudents.filter(s => !matched.includes(s));
      }
    }
    
    // Distribute remaining students across groups, respecting group size limits
    let currentGroupIndex = 0;
    for (let i = 0; i < remainingStudents.length; i++) {
      // Find a group that has space
      let attempts = 0;
      while (groupedStudents[currentGroupIndex].length >= groupSize && attempts < totalGroups) {
        currentGroupIndex = (currentGroupIndex + 1) % totalGroups;
        attempts++;
      }
      
      // If no group has space, create a new group
      if (groupedStudents[currentGroupIndex].length >= groupSize) {
        groupedStudents.push([]);
        currentGroupIndex = groupedStudents.length - 1;
      }
      
      groupedStudents[currentGroupIndex].push(remainingStudents[i]);
      currentGroupIndex = (currentGroupIndex + 1) % totalGroups;
    }
    
    // Filter out empty groups
    groupedStudents = groupedStudents.filter(group => group.length > 0);

    const batchId = uuidv4();

    // ✅ Save to history
    const insertHistory = `
      INSERT INTO group_generation_history
      (id, batch_id, generation_method, parameters, generated_by, status)
      VALUES (?, ?, ?, ?, ?, 'Active')
    `;

    db.query(
      insertHistory,
      [
        uuidv4(),
        batchId,
        "Algorithm",
        JSON.stringify({ studentsPerGroup, numberOfGroups, genderBalance, academicBalance, distributionMethod, keepTogether }),
        userId
      ],
      (err2) => {
        if (err2) {
          console.error("Error inserting group_generation_history:", err2);
          return res.status(500).json({ message: "Error saving group history" });
        }

        // Insert groups
        const groupInserts = groupedStudents.map((grp, index) => {
          return new Promise((resolve, reject) => {
            const groupName = `Group ${index + 1}`;
            const groupQuery = `
              INSERT INTO \`groups\` (name, course_id, department_id, created_by, batch_id, generation_method, generation_parameters)
              VALUES (?, ?, (SELECT department_id FROM users WHERE id = ?), ?, ?, ?, ?)
            `;
            const params = [
              groupName,
              courseId,
              userId,
              userId,
              batchId,
              "Algorithm",
              JSON.stringify({ studentsPerGroup, numberOfGroups, genderBalance, academicBalance, distributionMethod, keepTogether })
            ];

            db.query(groupQuery, params, (err3, result) => {
              if (err3) return reject(err3);
              const groupId = result.insertId;

              const memberValues = grp.map(s => [groupId, s.id, "member"]);
              if (memberValues.length > 0) {
                const memberQuery = `INSERT INTO group_members (group_id, student_id, role) VALUES ?`;
                db.query(memberQuery, [memberValues], (err4) => {
                  if (err4) return reject(err4);
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
      }
    );
  });
};




// ✅ Fetch all groups in a batch (with batch status)
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
      s.gender,
      h.status AS batch_status   -- ✅ added batch status
    FROM \`groups\` g
    LEFT JOIN courses c ON g.course_id = c.id
    LEFT JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN students s ON gm.student_id = s.id
    LEFT JOIN group_generation_history h ON g.batch_id = h.batch_id
    WHERE g.created_by = ? AND g.batch_id = ?
    ORDER BY g.id, s.index_number
  `;

  db.query(query, [userId, batchId], (err, results) => {
    if (err) {
      console.error("Error fetching groups by batch:", err);
      return res.status(500).json({ message: "Error fetching groups" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No groups found for this batch" });
    }

    // ✅ Restructure into groups with member lists
    const grouped = {};
    let batchStatus = results[0].batch_status || "Active"; // get status from history

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

    res.json(Object.values(grouped || {}));


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

exports.deleteGroup = (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // First delete group members
  const deleteMembers = `DELETE FROM group_members WHERE group_id = ?`;

  db.query(deleteMembers, [groupId], (err) => {
    if (err) {
      console.error("Error deleting group members:", err);
      return res.status(500).json({ message: "Error deleting group members" });
    }

    // Now delete group
    const deleteGroupQuery = `DELETE FROM \`groups\` WHERE id = ? AND created_by = ?`;
    db.query(deleteGroupQuery, [groupId, userId], (err, result) => {
      if (err) {
        console.error("Error deleting group:", err);
        return res.status(500).json({ message: "Error deleting group" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Group not found or not owned by user" });
      }
      res.json({ message: "Group deleted successfully" });
    });
  });
};

exports.updateBatchStatus = (req, res) => {
  const { batchId } = req.params;
  const { status } = req.body;

  console.log("BODY DEBUG:", req.body);
  console.log("batchId received:", batchId)

  const query = `
    UPDATE group_generation_history 
    SET status = ? 
    WHERE batch_id = ?`;

  db.query(query, [status, batchId], (err, result) => {
    if (err) {
      console.error("Error updating batch status:", err);
      return res.status(500).json({ message: "Error updating batch status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json({ message: "Batch status updated successfully" });
  });
};

// ✅ Rename a specific group (owned by lecturer)
exports.renameGroup = (req, res) => {
  const userId = req.user.id;
  const { groupId } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "New group name is required" });
  }

  const sql = `UPDATE \`groups\` SET name = ? WHERE id = ? AND created_by = ?`;
  db.query(sql, [name.trim(), groupId, userId], (err, result) => {
    if (err) {
      console.error("Error renaming group:", err);
      return res.status(500).json({ message: "Error renaming group" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Group not found or not owned by user" });
    }
    res.json({ message: "Group renamed successfully" });
  });
};

// ✅ Resize groups within a batch by rebalancing members
// Accepts either studentsPerGroup or numberOfGroups
exports.resizeBatchGroups = (req, res) => {
  const userId = req.user.id;
  const { batchId } = req.params;
  const { studentsPerGroup, numberOfGroups } = req.body;

  if (!studentsPerGroup && !numberOfGroups) {
    return res.status(400).json({ message: "Provide studentsPerGroup or numberOfGroups" });
  }

  // Fetch all members in batch grouped by group
  const fetchSql = `
    SELECT g.id AS group_id, gm.student_id
    FROM \`groups\` g
    JOIN group_members gm ON gm.group_id = g.id
    WHERE g.batch_id = ? AND g.created_by = ?
  `;

  db.query(fetchSql, [batchId, userId], (err, rows) => {
    if (err) {
      console.error("Error fetching batch members:", err);
      return res.status(500).json({ message: "Error fetching batch members" });
    }
    if (!rows.length) {
      return res.status(404).json({ message: "No groups found for this batch" });
    }

    const studentIds = rows.map(r => r.student_id);
    const uniqueStudents = [...new Set(studentIds)];

    let targetGroupSize;
    let totalGroups;
    if (studentsPerGroup) {
      targetGroupSize = parseInt(studentsPerGroup, 10);
      totalGroups = Math.ceil(uniqueStudents.length / targetGroupSize);
    } else {
      totalGroups = parseInt(numberOfGroups, 10);
      targetGroupSize = Math.ceil(uniqueStudents.length / totalGroups);
    }

    // Shuffle students
    uniqueStudents.sort(() => Math.random() - 0.5);

    // Partition
    const partitions = Array.from({ length: totalGroups }, () => []);
    uniqueStudents.forEach((sid, idx) => {
      partitions[idx % totalGroups].push(sid);
    });

    // Fetch existing group ids ordered
    const fetchGroupIdsSql = `SELECT id FROM \`groups\` WHERE batch_id = ? AND created_by = ? ORDER BY id`;
    db.query(fetchGroupIdsSql, [batchId, userId], (gidErr, groupRows) => {
      if (gidErr) {
        console.error("Error fetching group ids:", gidErr);
        return res.status(500).json({ message: "Error updating groups" });
      }

      if (groupRows.length === 0) {
        return res.status(404).json({ message: "No groups to update" });
      }

      const existingGroupIds = groupRows.map(r => r.id);

      const adjustGroups = (cb) => {
        if (existingGroupIds.length === totalGroups) return cb();
        if (existingGroupIds.length < totalGroups) {
          // create additional groups
          const toCreate = totalGroups - existingGroupIds.length;
          let created = 0;
          const templateId = existingGroupIds[0];
          const insertSql = `INSERT INTO \`groups\` (name, batch_id, created_by, course_id, department_id, generation_method) 
                             SELECT ?, ?, ?, g.course_id, g.department_id, 'Resize' FROM \`groups\` g WHERE g.id = ? LIMIT 1`;
          for (let i = 0; i < toCreate; i++) {
            const name = `Group ${existingGroupIds.length + i + 1}`;
            db.query(insertSql, [name, batchId, userId, templateId], (insErr, insRes) => {
              if (insErr) {
                console.error("Error creating additional group:", insErr);
                return res.status(500).json({ message: "Error creating additional groups" });
              }
              existingGroupIds.push(insRes.insertId);
              created++;
              if (created === toCreate) cb();
            });
          }
        } else {
          // delete surplus groups (and members)
          const toDeleteIds = existingGroupIds.slice(totalGroups);
          if (toDeleteIds.length === 0) return cb();
          const delMembersSql = `DELETE FROM group_members WHERE group_id IN (?)`;
          db.query(delMembersSql, [toDeleteIds], (dmErr) => {
            if (dmErr) {
              console.error("Error deleting surplus members:", dmErr);
              return res.status(500).json({ message: "Error deleting surplus members" });
            }
            const delGroupsSql = `DELETE FROM \`groups\` WHERE id IN (?)`;
            db.query(delGroupsSql, [toDeleteIds], (dgErr) => {
              if (dgErr) {
                console.error("Error deleting surplus groups:", dgErr);
                return res.status(500).json({ message: "Error deleting surplus groups" });
              }
              existingGroupIds.length = totalGroups;
              cb();
            });
          });
        }
      };

      adjustGroups(() => {
        // Clear all members in this batch
        const delSql = `DELETE gm FROM group_members gm JOIN \`groups\` g ON gm.group_id = g.id WHERE g.batch_id = ? AND g.created_by = ?`;
        db.query(delSql, [batchId, userId], (delErr) => {
          if (delErr) {
            console.error("Error clearing old members:", delErr);
            return res.status(500).json({ message: "Error clearing old members" });
          }

          // Reinsert members per partitions
          const allInserts = [];
          partitions.forEach((part, idx) => {
            const groupId = existingGroupIds[idx];
            part.forEach(studentId => {
              allInserts.push([groupId, studentId, 'member']);
            });
          });

          if (allInserts.length === 0) {
            return res.json({ message: "Resize complete", groups: totalGroups, membersAssigned: 0 });
          }

          const insMembersSql = `INSERT INTO group_members (group_id, student_id, role) VALUES ?`;
          db.query(insMembersSql, [allInserts], (insErr2, insRes2) => {
            if (insErr2) {
              console.error("Error inserting resized members:", insErr2);
              return res.status(500).json({ message: "Error assigning members" });
            }

            return res.json({ message: "Resize complete", groups: totalGroups, membersAssigned: insRes2.affectedRows });
          });
        });
      });
    });
  });
};

exports.updateBatchCourseName = (req, res) => {
  const userId = req.user.id;
  const { batchId } = req.params;
  const { courseName } = req.body;

  if (!courseName || !courseName.trim()) {
    return res.status(400).json({ message: "Course name is required" });
  }

  // Find the course_id associated with this batch and ensure ownership
  const findSql = `
    SELECT DISTINCT g.course_id
    FROM \`groups\` g
    WHERE g.batch_id = ? AND g.created_by = ?
    LIMIT 1
  `;

  db.query(findSql, [batchId, userId], (fErr, rows) => {
    if (fErr) {
      console.error("Error finding batch course:", fErr);
      return res.status(500).json({ message: "Error updating course name" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const courseId = rows[0].course_id;
    const updSql = `UPDATE courses SET course_name = ? WHERE id = ?`;
    db.query(updSql, [courseName.trim(), courseId], (uErr, uRes) => {
      if (uErr) {
        console.error("Error updating course name:", uErr);
        return res.status(500).json({ message: "Error updating course name" });
      }
      return res.json({ message: "Course name updated", courseId });
    });
  });
};

exports.deleteBatch = (req, res) => {
  const { batchId } = req.params;
  const userId = req.user.id;

  // Step 1: Delete group members belonging to groups in this batch and owned by user
  const deleteMembersQuery = `
    DELETE gm FROM group_members gm
    JOIN \`groups\` g ON gm.group_id = g.id
    WHERE g.batch_id = ? AND g.created_by = ?
  `;

  db.query(deleteMembersQuery, [batchId, userId], (err) => {
    if (err) {
      console.error("Error deleting group members for batch:", err);
      return res.status(500).json({ message: "Error deleting group members" });
    }

    // Step 2: Delete groups in this batch owned by user
    const deleteGroupsQuery = `DELETE FROM \`groups\` WHERE batch_id = ? AND created_by = ?`;
    db.query(deleteGroupsQuery, [batchId, userId], (err2) => {
      if (err2) {
        console.error("Error deleting groups for batch:", err2);
        return res.status(500).json({ message: "Error deleting groups" });
      }

      // Step 3: Delete batch history
      const deleteHistoryQuery = `DELETE FROM group_generation_history WHERE batch_id = ?`;
      db.query(deleteHistoryQuery, [batchId], (err3) => {
        if (err3) {
          console.error("Error deleting batch history:", err3);
          return res.status(500).json({ message: "Error deleting batch history" });
        }

        res.json({ message: "Batch deleted successfully" });
      });
    });
  });
};


