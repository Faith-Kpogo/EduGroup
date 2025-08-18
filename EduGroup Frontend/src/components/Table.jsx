import React from 'react';
import '../Styles/Table.css';

const Table = ({ data = [] }) => {
  return (
    <div className="table-responsive-custom">
      <table className="table">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Course</th>
            <th>Date Created</th>
            <th>Students</th>
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
            data.map((group) => (
              <tr key={group.id}>
                <td>{group.group_name}</td>
                <td>{group.course || group.course_name || "N/A"}</td>
                <td>{group.created_at ? new Date(group.created_at).toLocaleDateString() : "N/A"}</td>
                <td>{group.student_count || 0}</td>
                <td>{group.status || "Active"}</td>
                <td>
                  <button className="btn btn-sm btn-primary">
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
