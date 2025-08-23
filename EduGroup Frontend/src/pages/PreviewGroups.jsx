import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import "../Styles/PreviewGroups.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PreviewGroups = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `http://localhost:5000/api/groups/batch/${batchId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGroups(res.data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [batchId]);

  // ✅ Export to Excel (XLSX)
  const handleExport = () => {
    if (groups.length === 0) return;

    // Flatten groups into rows
    const rows = [];
    groups.forEach((group, idx) => {
      group.members.forEach((student) => {
        rows.push({
          Group: `Group ${idx + 1}`,
          "Index Number": student.index_number,
        });
      });
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Groups");

    // Export file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `groups_batch_${batchId}.xlsx`);
  };

  if (loading)
    return (
      <MainLayout>
        <p>Loading groups...</p>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="preview-groups-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="preview-groups-title">Groups Preview</h3>
          <button className="btn btn-success" onClick={handleExport}>
            Export to Excel
          </button>
        </div>

        {groups.length > 0 && (
          <h4 className="group-course mb-4">Course: {groups[0].course}</h4>
        )}
        <p className="text-muted">
          Total Students Grouped:{" "}
          {groups.reduce((total, g) => total + g.members.length, 0)}
        </p>

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
                    {group.members.map((student, i) => (
                      <li key={i}>
                        {student.index_number} ({student.gender})
                      </li>
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
      </div>
    </MainLayout>
  );
};

export default PreviewGroups;
