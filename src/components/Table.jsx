import React from 'react';
import '../Styles/Table.css'

const Table = ({ groups }) => {
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
          <tr>
            <td colSpan="6" className="text-center">
              No groups created yet. Click "Create New Group" to get started.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table;
