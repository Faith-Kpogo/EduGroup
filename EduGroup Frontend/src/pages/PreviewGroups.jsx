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
  const [resizeModes, setResizeModes] = useState({
    studentsPerGroup: true,
    numberOfGroups: false
  });
  const [studentsPerGroup, setStudentsPerGroup] = useState("");
  const [numberOfGroups, setNumberOfGroups] = useState("");
  const [resizing, setResizing] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  // ✅ Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/groups/batch/${batchId}`,
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
        `${process.env.REACT_APP_API_URL}/api/groups/batch/${batchId}`,
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
        `${process.env.REACT_APP_API_URL}/api/groups/batch/${batchId}/course-name`,
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
    
    // Check if students per group is selected and has valid input
    if (resizeModes.studentsPerGroup && studentsPerGroup.trim()) {
      const val = parseInt(studentsPerGroup, 10);
      if (!val || val <= 0) {
        toast.warning("Enter a valid students-per-group");
        return;
      }
      body.studentsPerGroup = val;
    }
    
    // Check if number of groups is selected and has valid input
    if (resizeModes.numberOfGroups && numberOfGroups.trim()) {
      const val = parseInt(numberOfGroups, 10);
      if (!val || val <= 0) {
        toast.warning("Enter a valid number of groups");
        return;
      }
      body.numberOfGroups = val;
    }
    
    // Check if at least one option is selected
    if (!resizeModes.studentsPerGroup && !resizeModes.numberOfGroups) {
      toast.warning("Please select at least one grouping option");
      return;
    }
    
    // Check if at least one input has a value
    if (!studentsPerGroup.trim() && !numberOfGroups.trim()) {
      toast.warning("Please enter values for the selected options");
      return;
    }

    try {
      setResizing(true);
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/groups/batch/${batchId}/resize`,
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
    const token = localStorage.getItem("token");
    try {
      setDeleting(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/groups/batch/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Batch deleted successfully!");
      navigate("/groupshistory");
    } catch (err) {
      console.error("Error deleting batch:", err);
      toast.error("Failed to delete batch");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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

        {/* Update grouping parameters (toggled) */}
        {showUpdate && (
          <div className="update-parameters-container bg-white rounded shadow-sm p-4 mb-4">
            <div className="update-header mb-3">
              <h5 className="mb-0 text-primary fw-bold">
                <i className="fas fa-cog me-2"></i>
                Update Grouping Parameters
              </h5>
              <p className="text-muted mb-0 small">Select one or both options to modify your groups</p>
            </div>
            
            <div className="update-options">
              {/* Students per group option */}
              <div className="option-card mb-3 p-3 border rounded">
                <div className="d-flex align-items-center mb-2">
                  <div className="form-check">
                    <input
                      className="checkInput"
                      type="checkbox"
                      id="modeStudentsPerGroup"
                      checked={resizeModes.studentsPerGroup}
                      onChange={(e) => setResizeModes(prev => ({
                        ...prev,
                        studentsPerGroup: e.target.checked
                      }))}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="modeStudentsPerGroup">
                      Students per Group
                    </label>
                  </div>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter number of students per group (e.g., 5)"
                    value={studentsPerGroup}
                    onChange={(e) => setStudentsPerGroup(e.target.value)}
                    disabled={!resizeModes.studentsPerGroup}
                    min="1"
                  />
                  <span className="input-group-text">students</span>
                </div>
                {resizeModes.studentsPerGroup && !studentsPerGroup.trim() && (
                  <small className="text-warning">Please enter a value for students per group</small>
                )}
              </div>

              {/* Number of groups option */}
              <div className="option-card mb-3 p-3 border rounded">
                <div className="d-flex align-items-center mb-2">
                  <div className="form-check">
                    <input
                      className="checkInput"
                      type="checkbox"
                      id="modeNumberOfGroups"
                      checked={resizeModes.numberOfGroups}
                      onChange={(e) => setResizeModes(prev => ({
                        ...prev,
                        numberOfGroups: e.target.checked
                      }))}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="modeNumberOfGroups">
                      Number of Groups
                    </label>
                  </div>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter total number of groups (e.g., 10)"
                    value={numberOfGroups}
                    onChange={(e) => setNumberOfGroups(e.target.value)}
                    disabled={!resizeModes.numberOfGroups}
                    min="1"
                  />
                  <span className="input-group-text">groups</span>
                </div>
                {resizeModes.numberOfGroups && !numberOfGroups.trim() && (
                  <small className="text-warning">Please enter a value for number of groups</small>
                )}
              </div>
            </div>

            <div className="update-actions d-flex gap-2 mt-3">
              <button 
                className="btn btn-primary px-4" 
                onClick={handleResize} 
                disabled={resizing || (!resizeModes.studentsPerGroup && !resizeModes.numberOfGroups)}
              >
                {resizing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setShowUpdate(false);
                  setResizeModes({ studentsPerGroup: true, numberOfGroups: false });
                  setStudentsPerGroup("");
                  setNumberOfGroups("");
                }}
              >
                Cancel
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
            <button 
              className="btn btn-danger" 
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="fas fa-trash me-2"></i>
              Delete Entire Course Grouping
            </button>
            <button className="btn btn-primary" onClick={handleGoToDashboard}>
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <div className="delete-modal-header">
                <h4>Delete Course Grouping</h4>
              </div>
              
              <div className="delete-modal-body">
                <p className="delete-warning">
                  Are you sure you want to delete this entire course grouping?
                </p>
                <div className="delete-note">
                  <i className="fas fa-info-circle me-2"></i>
                  This action cannot be undone. All groups and their data will be permanently deleted.
                </div>
              </div>
              
              <div className="delete-modal-footer">
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDeleteBatch}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash me-2"></i>
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PreviewGroups;
