import React from "react";
import { useLocation, useNavigate, } from "react-router-dom";
import MainLayout from "../components/MainLayout";

const PreviewGroups = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, batchId } = location.state || {};

  if (!groups || !batchId) {
    return (
      <MainLayout>
        <div className="p-4">
          <h3>No groups to preview</h3>
          <button
            className="btn btn-outline-primary mt-3"
            onClick={() => navigate("/creategroups")}
          >
            Back to Create Groups
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4">
        <h3>Preview Groups</h3>
        <p className="text-muted">
          Review the generated groups before finalizing.
        </p>

        <div className="row">
          {groups.map((group, idx) => (
            <div key={group.id} className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header">
                  <strong>{group.name}</strong>
                </div>
                <div className="card-body">
                  <p><strong>Group Size:</strong> {group.members.length}</p>
                  <ul className="list-group">
                    {group.members.map((student) => (
                      <li
                        key={student.id}
                        className="list-group-item d-flex justify-content-between"
                      >
                        {student.first_name} {student.last_name}
                        <span className="badge bg-secondary">{student.gender}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex gap-3 mt-4">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/creategroups")}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard", { state: { success: true } })}
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PreviewGroups;
