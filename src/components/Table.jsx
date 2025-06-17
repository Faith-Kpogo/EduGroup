import React from 'react';
import '../Styles/Table.css'

const Table = ({ groups }) => {
  return (
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
        <td colSpan="6" className="text-center">No groups created yet. Click "Create New Group" to get started.</td>
    </tbody>
  </table>
  );
};

export default Table;
