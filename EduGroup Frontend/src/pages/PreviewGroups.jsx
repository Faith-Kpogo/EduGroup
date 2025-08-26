import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import "../Styles/PreviewGroups.css";
import { useToast } from "../components/Toast";

// ✅ NEW IMPORTS
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PreviewGroups = () => {
  const toast = useToast();
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseName, setCourseName] = useState("");

  // resize controls
  const [resizeMode, setResizeMode] = useState("studentsPerGroup");
  const [studentsPerGroup, setStudentsPerGroup] = useState("");
  const [numberOfGroups, setNumberOfGroups] = useState("");
  const [resizing, setResizing] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/groups/batch/${batchId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const safeData = Array.isArray(res.data) ? res.data : [];
        setGroups(safeData);
        if (safeData.length > 0) {
          setCourseName(safeData[0].course || "Imported Course");
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [batchId]);

  const refetch = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/groups/batch/${batchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p>Loading groups...</p>
      </MainLayout>
    );
  }

  // ✅ Export to Excel
  const handleExport = () => {
    if (!groups || groups.length === 0) {
      toast.error("No groups available to export");
      return;
    }

    // Flatten groups into rows for Excel
    const exportData = groups.flatMap((group, idx) =>
      (group.members || []).map((student) => ({
        Group: `Group ${idx + 1}`,
        IndexNumber: student.index_number,
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Groups");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, `Batch_${batchId}_Groups.xlsx`);
    toast.success("Export successful!");
  };

  // Save rename
  const handleSaveCourseName = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.put(
        `http://localhost:5000/api/groups/batch/${batchId}/course-name`,
        { courseName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Course name updated");
      setEditingCourse(false);
    } catch (err) {
      console.error("Failed to update course name:", err);
      toast.error("Failed to update course name");
    }
  };

  // ✅ Resize groups in batch
  const handleResize = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const body = {};
    if (resizeMode === "studentsPerGroup") {
      const val = parseInt(studentsPerGroup, 10);
      if (!val || val <= 0) {
        toast.warning("Enter a valid students-per-group");
        return;
      }
      body.studentsPerGroup = val;
    } else {
      const val = parseInt(numberOfGroups, 10);
      if (!val || val <= 0) {
        toast.warning("Enter a valid number of groups");
        return;
      }
      body.numberOfGroups = val;
    }

    try {
      setResizing(true);
      await axios.put(
        `http://localhost:5000/api/groups/batch/${batchId}/resize`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Changes saved");
      await refetch();
      setShowUpdate(false);
    } catch (err) {
      console.error("Failed to resize:", err);
      toast.error(err.response?.data?.message || "Failed to save changes");
    } finally {
      setResizing(false);
    }
  };

  // ✅ Redirect to dashboard
  const handleGoToDashboard = () => {
    toast.success("Changes saved! Redirecting...");
    navigate("/dashboard");
  };

  // ✅ Delete entire batch
  const handleDeleteBatch = async () => {
    if (!window.confirm("Are you sure you want to delete this entire course grouping?"))
      return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/groups/batch/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Batch deleted successfully!");
      navigate("/groupshistory");
    } catch (err) {
      console.error("Error deleting batch:", err);
      toast.error("Failed to delete batch");
    }
  };

  return (
    <MainLayout>
      <div className="preview-groups-container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="preview-groups-title">Groups Preview</h3>
          <div className="d-flex gap-2">
            {/* Update toggle */}
            <button className="btn btn-outline-primary" onClick={() => setShowUpdate(!showUpdate)}>
              {showUpdate ? "Close" : "Update"}
            </button>
            {/* Edit & Save course name controls */}
            {editingCourse ? (
              <>
                <input
                  className="form-control"
                  style={{ maxWidth: 240 }}
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSaveCourseName}>Save</button>
                <button className="btn btn-outline-secondary" onClick={() => setEditingCourse(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-outline-secondary" onClick={() => setEditingCourse(true)}>
                Edit
              </button>
            )}
            {/* Export */}
            <button className="btn btn-outline-success" onClick={handleExport}>
              Export
            </button>
          </div>
        </div>

        {groups.length > 0 && (
          <h4 className="group-course mb-2">Course: {courseName || (groups[0].course || "Imported Course")}</h4>
        )}
        <p className="text-muted">
          Total Students Grouped: {Array.isArray(groups)
            ? groups.reduce(
                (total, g) => total + (g.members?.length || 0),
                0
              )
            : 0}
        </p>

        {/* Regenerate controls (toggled) */}
        {showUpdate && (
          <div className="bg-white rounded shadow-sm p-3 mb-3">
            <h5 className="mb-2">Update grouping parameters</h5>
            <div className="d-flex flex-wrap align-items-end gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="resizeMode"
                  id="modeStudentsPerGroup"
                  checked={resizeMode === "studentsPerGroup"}
                  onChange={() => setResizeMode("studentsPerGroup")}
                />
                <label className="form-check-label" htmlFor="modeStudentsPerGroup">
                  By students per group
                </label>
              </div>
              <input
                type="number"
                className="form-control"
                style={{ maxWidth: 160 }}
                placeholder="e.g. 5"
                value={studentsPerGroup}
                onChange={(e) => setStudentsPerGroup(e.target.value)}
                disabled={resizeMode !== "studentsPerGroup"}
              />

              <div className="form-check ms-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="resizeMode"
                  id="modeNumberOfGroups"
                  checked={resizeMode === "numberOfGroups"}
                  onChange={() => setResizeMode("numberOfGroups")}
                />
                <label className="form-check-label" htmlFor="modeNumberOfGroups">
                  By number of groups
                </label>
              </div>
              <input
                type="number"
                className="form-control"
                style={{ maxWidth: 160 }}
                placeholder="e.g. 10"
                value={numberOfGroups}
                onChange={(e) => setNumberOfGroups(e.target.value)}
                disabled={resizeMode !== "numberOfGroups"}
              />

              <button className="btn btn-primary" onClick={handleResize} disabled={resizing}>
                {resizing ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}

        {/* Groups grid */}
        {groups.length === 0 ? (
          <p>No groups found for this batch.</p>
        ) : (
          <div className="groups-grid">
            {groups.map((group, idx) => (
              <div key={group.id} className="group-card">
                <div className="card-body">
                  <h5 className="group-card-title">Group {idx + 1}</h5>
                  <p>
                    <strong>Members:</strong>
                  </p>
                  <ul className="group-members-list">
                    {Array.isArray(group.members) &&
                      group.members.map((student, i) => (
                        <li key={i}>{student.index_number}</li>
                      ))}
                  </ul>
                  <button
                    className="btn btn-sm btn-outline-primary mt-3"
                    onClick={() => navigate(`/groupdetails/${group.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save + Delete buttons */}
        {groups.length > 0 && (
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-danger" onClick={handleDeleteBatch}>
              Delete Entire Course Grouping
            </button>
            <button className="btn btn-primary" onClick={handleGoToDashboard}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PreviewGroups;
