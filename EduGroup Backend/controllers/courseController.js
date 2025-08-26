// controllers/courseController.js
const db = require("../models/db");  // make sure db is imported
const csv = require("fast-csv");
let XLSX;
try {
  XLSX = require("xlsx");
} catch (e) {
  // Will be required at runtime; if missing, prompt to install
  XLSX = null;
}

function normalizeKey(key) {
  return String(key || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function parseUploadedData(file) {
  const buffer = file.buffer;
  const original = String(file.originalname || "").toLowerCase();
  const mimetype = String(file.mimetype || "").toLowerCase();

  const isXlsxExt = original.endsWith(".xlsx") || original.endsWith(".xls");
  const isExcelMime = mimetype.includes("spreadsheet") || mimetype.includes("excel");
  const isCsvExt = original.endsWith(".csv");

  const isExcel = isXlsxExt || (isExcelMime && !isCsvExt);

  if (isExcel) {
    if (!XLSX) {
      const err = new Error(
        "Excel import requires 'xlsx' package. Please install it: npm install xlsx"
      );
      err.code = 'MISSING_XLSX';
      throw err;
    }
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames && workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    // Get rows as array of objects (header row used)
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    return { rows, isExcel: true };
  }

  // CSV fallback
  return await new Promise((resolve, reject) => {
    const rows = [];
    let headers = null;
    csv
      .parseString(buffer.toString("utf-8"), {
        headers: true,
        ignoreEmpty: true,
        trim: true,
      })
      .on("headers", (h) => {
        headers = h;
      })
      .on("data", (row) => rows.push(row))
      .on("error", (e) => reject(e))
      .on("end", () => resolve({ rows, headers, isExcel: false }));
  });
}

function generatePlaceholderEmail(indexNumber) {
  const base = String(indexNumber || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safe = base || Math.random().toString(36).slice(2, 10);
  return `${safe}@students.local`;
}

exports.getCoursesByDepartment = (req, res) => {
  const userId = req.user.id;
  const { level } = req.query;  // 👈 level from frontend query param

  let query = `
    SELECT c.id, c.course_code, c.course_name, c.level
    FROM courses c
    JOIN user_departments ud ON ud.department_id = c.department_id AND ud.is_primary = TRUE
    WHERE ud.user_id = ?
  `;
  const params = [userId];

  // If level is provided, filter by level
  if (level) {
    query += " AND c.level = ?";
    params.push(level);
  }

  query += " ORDER BY c.course_code";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Error fetching courses:", err);
      return res.status(500).json({ message: "Error fetching courses" });
    }

    // Return empty list instead of 404 so UI can show 'no courses'
    if (!results.length) {
      return res.json([]);
    }

    res.json(results);
  });
};


// controllers/coursesController.js
exports.getCourseStudents = (req, res) => {
  const { courseId } = req.params;

  const query = `
    SELECT s.id, s.index_number, s.first_name, s.last_name
    FROM student_courses sc
    JOIN students s ON sc.student_id = s.id
    WHERE sc.course_id = ?
  `;

  db.query(query, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ message: "Error fetching students" });
    }
    res.json(results);
  });
};

// ✅ Import students via CSV/Excel and link to existing course
// Accepted formats:
// 1) index_number,first_name,last_name,gender
// 2) single column: Index Number (list of index numbers)
exports.importStudents = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "CSV or Excel file is required" });
  }

  // Ensure the course exists
  const courseQuery = `SELECT id, department_id, course_name FROM courses WHERE id = ?`;
  db.query(courseQuery, [courseId], async (courseErr, courseRows) => {
    if (courseErr) {
      console.error("Error checking course:", courseErr);
      return res.status(500).json({ message: "Error validating course" });
    }
    if (!courseRows || courseRows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const { department_id: departmentId, course_name: courseName } = courseRows[0];

    let parsed;
    try {
      parsed = await parseUploadedData(req.file);
    } catch (e) {
      console.error("Parse error:", e);
      if (e.code === 'MISSING_XLSX') {
        return res.status(500).json({ message: e.message });
      }
      return res.status(400).json({ message: "Invalid file format" });
    }

    const students = [];
    let headerKeys = null;

    if (parsed.isExcel) {
      // parsed.rows is array of objects with headers from sheet
      if (parsed.rows.length > 0) {
        headerKeys = Object.keys(parsed.rows[0]).map(normalizeKey);
      }
      parsed.rows.forEach((row) => {
        const normalized = {};
        Object.keys(row || {}).forEach((k) => {
          normalized[normalizeKey(k)] = row[k];
        });
        const idx = normalized.indexnumber || normalized.index || normalized.indexno || normalized.indexnum || normalized.index_number;
        const first = normalized.firstname || normalized.first || normalized.first_name;
        const last = normalized.lastname || normalized.last || normalized.last_name;
        const gender = normalized.gender || normalized.sex;
        const indexNumber = String(idx || row[Object.keys(row)[0]] || "").trim();
        if (indexNumber) {
          const firstName = String(first || "Unknown").trim();
          const lastName = String(last || "").trim();
          const genderVal = String(gender || "").trim() || null;
          students.push({ indexNumber, firstName, lastName, gender: genderVal });
        }
      });
    } else {
      headerKeys = parsed.headers ? parsed.headers.map(normalizeKey) : null;
      parsed.rows.forEach((row) => {
        const normalized = {};
        Object.keys(row || {}).forEach((k) => {
          normalized[normalizeKey(k)] = row[k];
        });
        const idx = normalized.indexnumber || normalized.index || normalized.indexno || normalized.indexnum || normalized.index_number;
        const first = normalized.firstname || normalized.first || normalized.first_name;
        const last = normalized.lastname || normalized.last || normalized.last_name;
        const gender = normalized.gender || normalized.sex;
        let indexNumber = String(idx || "").trim();
        if (!indexNumber && headerKeys && headerKeys.length === 1) {
          indexNumber = String(row[Object.keys(row)[0]] || "").trim();
        }
        if (indexNumber) {
          const firstName = String(first || "Unknown").trim();
          const lastName = String(last || "").trim();
          const genderVal = String(gender || "").trim() || null;
          students.push({ indexNumber, firstName, lastName, gender: genderVal });
        }
      });
    }

    if (students.length === 0) {
      return res.status(400).json({ message: "No valid rows found in the file" });
    }

    const connection = db;

    const studentValues = students.map((s) => [
      s.indexNumber,
      s.firstName,
      s.lastName,
      s.gender,
      departmentId,
      generatePlaceholderEmail(s.indexNumber)
    ]);
    const insertStudentsSql = `
      INSERT INTO students (index_number, first_name, last_name, gender, department_id, email)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        gender = VALUES(gender),
        department_id = VALUES(department_id),
        email = VALUES(email)
    `;

    connection.query(insertStudentsSql, [studentValues], (insErr) => {
      if (insErr) {
        console.error("Error inserting students:", insErr);
        return res.status(500).json({ message: "Error inserting students", error: String(insErr && insErr.message || insErr) });
      }

      const selectIdsSql = `SELECT id, index_number FROM students WHERE index_number IN (?)`;
      const indexList = students.map((s) => s.indexNumber);
      connection.query(selectIdsSql, [indexList], (selErr, idRows) => {
        if (selErr) {
          console.error("Error fetching student ids:", selErr);
          return res.status(500).json({ message: "Error mapping students", error: String(selErr && selErr.message || selErr) });
        }

        const idByIndex = new Map(idRows.map((r) => [r.index_number, r.id]));
        const mappingValues = students
          .map((s) => idByIndex.get(s.indexNumber))
          .filter(Boolean)
          .map((studentId) => [studentId, Number(courseId)]);

        const finalize = (mapped) =>
          res.json({ message: "Import successful", imported: students.length, mapped, courseId: Number(courseId), courseName });

        if (mappingValues.length === 0) {
          return finalize(0);
        }

        const mapSql = `
          INSERT IGNORE INTO student_courses (student_id, course_id)
          VALUES ?
        `;
        connection.query(mapSql, [mappingValues], (mapErr, mapRes) => {
          if (mapErr) {
            console.error("Error mapping students to course:", mapErr);
            return res.status(500).json({ message: "Error mapping students to course", error: String(mapErr && mapErr.message || mapErr) });
          }

          return finalize(mapRes.affectedRows);
        });
      });
    });
  });
};

// ✅ Import to a new temporary course (no courseId provided)
exports.importStudentsNoCourse = (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "CSV or Excel file is required" });
  }

  // Find user's primary department
  const deptSql = `
    SELECT d.id, d.code
    FROM user_departments ud
    JOIN departments d ON d.id = ud.department_id
    WHERE ud.user_id = ? AND ud.is_primary = TRUE
    LIMIT 1
  `;

  db.query(deptSql, [userId], (deptErr, deptRows) => {
    if (deptErr) {
      console.error("Error fetching department:", deptErr);
      return res.status(500).json({ message: "Error determining department" });
    }
    if (!deptRows || deptRows.length === 0) {
      return res.status(400).json({ message: "No primary department selected" });
    }

    const departmentId = deptRows[0].id;
    const randomSuffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const courseName = `Imported Course ${randomSuffix}`;
    const courseCode = `IMP-${randomSuffix}`;

    // Use a non-null default level (e.g., 100) to satisfy NOT NULL constraint
    const defaultLevel = 100;
    const createCourseSql = `INSERT INTO courses (course_code, course_name, level, department_id) VALUES (?, ?, ?, ?)`;
    db.query(createCourseSql, [courseCode, courseName, defaultLevel, departmentId], (cErr, cRes) => {
      if (cErr) {
        console.error("Error creating temporary course:", cErr);
        return res.status(500).json({ message: "Error creating temporary course", error: String(cErr && cErr.message || cErr) });
      }

      // Reuse importStudents logic by setting params
      req.params.courseId = cRes.insertId;
      return exports.importStudents(req, res);
    });
  });
};
