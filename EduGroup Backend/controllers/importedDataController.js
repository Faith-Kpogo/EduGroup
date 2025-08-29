const db = require('../models/db');

// Store imported data
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

// Get imported data by ID
exports.getImportedData = (req, res) => {
  const { importId } = req.params;

  const selectQuery = `
    SELECT id, file_name, course_name, course_id, data_json, imported_by, created_at
    FROM imported_data 
    WHERE id = ?
  `;

  db.query(selectQuery, [importId], (err, results) => {
    if (err) {
      console.error("Error fetching imported data:", err);
      return res.status(500).json({ message: "Failed to fetch imported data" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Imported data not found" });
    }

    const importedData = results[0];
    importedData.data = JSON.parse(importedData.data_json);
    delete importedData.data_json;

    res.json(importedData);
  });
};

// Get all imported data for admin dashboard
exports.getAllImportedData = (req, res) => {
  const selectQuery = `
    SELECT 
      id, 
      file_name, 
      course_name, 
      course_id, 
      imported_by,
      created_at,
      JSON_LENGTH(data_json) as record_count
    FROM imported_data 
    ORDER BY created_at DESC
  `;

  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error fetching imported data:", err);
      return res.status(500).json({ message: "Failed to fetch imported data" });
    }

    res.json(results);
  });
};

// Delete imported data
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

// Get imported data statistics for admin dashboard
exports.getImportedDataStats = (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_imports,
      COUNT(DISTINCT imported_by) as unique_users,
      SUM(JSON_LENGTH(data_json)) as total_records,
      MAX(created_at) as latest_import
    FROM imported_data
  `;

  db.query(statsQuery, (err, results) => {
    if (err) {
      console.error("Error fetching imported data stats:", err);
      return res.status(500).json({ message: "Failed to fetch imported data stats" });
    }

    res.json(results[0]);
  });
};
