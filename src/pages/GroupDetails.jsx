import React from 'react';
import { useParams } from 'react-router-dom';
import { Edit, MoreVertical } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const GroupDetails = () => {
  const { groupId } = useParams();

  // Sample static placeholder data for empty group
  const group = {
    name: 'Group 1',
    course: 'INF 211',
    status: 'Active',
    totalStudents: 0,
    dateCreated: '---',
    performance: {
      high: 0,
      average: 0,
      low: 0,
    },
    students: [],
  };

  return (
    <div className="d-flex">
        <Sidebar />
    <div className="p-4 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
          >
            <span className="text-white fw-bold">G1</span>
          </div>
          <div>
            <h4 className="mb-0">{group.name}</h4>
            <small className="text-muted">{group.course}</small>
          </div>
          <span className="badge bg-success ms-2">{group.status}</span>
        </div>

        <div className="d-flex gap-2">
          <button className="btn mainbtn">
            <Edit size={16} className="me-1" /> Edit
          </button>
          <button className="btn btn-outline-secondary">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm p-3 mb-4">
        <h5>Group Overview</h5>
        <div className="row">
          <div className="col-md-4">
            <p><strong>Total students</strong></p>
            <p>{group.totalStudents}</p>
          </div>
          <div className="col-md-4">
            <p><strong>Date created</strong></p>
            <p>{group.dateCreated}</p>
          </div>
          <div className="col-md-4">
            <p><strong>Performance Distribution</strong></p>
            <ul className="list-unstyled">
              <li>High: {group.performance.high}</li>
              <li>Average: {group.performance.average}</li>
              <li>Low: {group.performance.low}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm p-3">
        <h5>Student list</h5>
        <input type="text" className="form-control mb-3" placeholder="Search students" disabled />
        <div className="alert alert-info">
          No students added to this group yet.
        </div>
      </div>
    </div>
    </div>
  );
};

export default GroupDetails;
