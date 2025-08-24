import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Table.css";

const Table = ({ data = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="table-responsive-custom">
      <table className="table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Total Groups</th>
            <th>Total Students</th>
            <th>Date Created</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No groups created yet. Click "Create New Group" to get started.
              </td>
            </tr>
          ) : (
            data.map((batch) => (
              <tr key={batch.batch_id}>
                <td>{batch.course_name || "N/A"}</td>
                <td>{batch.total_groups}</td>
                <td>{batch.total_students}</td>
                <td>
                  {batch.created_at
                    ? new Date(batch.created_at).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>{batch.status || "Active"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/previewgroups/${batch.batch_id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
