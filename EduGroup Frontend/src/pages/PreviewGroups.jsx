import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import "../Styles/PreviewGroups.css";

const PreviewGroups = () => {
  const { batchId } = useParams(); // ✅ batchId now comes from the URL
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchStatus, setBatchStatus] = useState("Active"); // ✅ status for whole batch

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

        // ✅ Ensure we always set an array
        const safeData = Array.isArray(res.data) ? res.data : [];
        setGroups(safeData);

        if (safeData.length > 0) {
          setBatchStatus(safeData[0].batch_status || "Active");
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
        setGroups([]); // fallback to empty
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [batchId]);

  if (loading) {
    return (
      <MainLayout>
        <p>Loading groups...</p>
      </MainLayout>
    );
  }

  // ✅ Save batch status change
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/groups/batch/${batchId}/status`,
        { status: batchStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Batch status updated successfully!");
    } catch (err) {
      console.error("Error saving batch status:", err);
      alert("Failed to save changes");
    }
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
      alert("Batch deleted successfully!");
      navigate("/groupshistory");
    } catch (err) {
      console.error("Error deleting batch:", err);
      alert("Failed to delete batch");
    }
  };

  return (
    <MainLayout>
      <div className="preview-groups-container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="preview-groups-title">Groups Preview</h3>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={batchStatus}
              onChange={(e) => setBatchStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button className="btn btn-outline-success">Export</button>
          </div>
        </div>

        {groups.length > 0 && (
          <h4 className="group-course mb-4">Course: {groups[0].course}</h4>
        )}
        <p className="text-muted">
          Total Students Grouped:{" "}
          {Array.isArray(groups)
            ? groups.reduce(
                (total, g) => total + (g.members?.length || 0),
                0
              )
            : 0}
        </p>

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
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PreviewGroups;
