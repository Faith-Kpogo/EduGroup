import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import '../Styles/CreateGroups.css'
import Sidebar from '../components/Sidebar';
import '../App.css'

const CreateGroups = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex">
        <Sidebar />
        <div className="main p-4 flex-grow-1">
        <h3>Create Groups</h3>
        <p className="text-muted">Define parameters for generating balanced student groups</p>

        <div className="create-groups-container bg-white p-4 rounded shadow-sm">
        <h5>Select Course and Students</h5>
        <div className="row mb-3 gap-5">
          <div className="col-md-5">
            <div className="mb-2">
              <label htmlFor="course" className="form-label">Course</label>
              <select id="course" className="form-select form-select-sm">
                <option>INF 402</option>
              </select>
            </div>
          </div>
          <div className="col-md-5">
            <div className="mb-2">
              <label htmlFor="section" className="form-label">Section</label>
              <select id="section" className="form-select form-select-sm">
                <option>All Sections</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-check mb-4">
          <input type="checkbox" className="form-check-input" id="enrolledStudents" />
          <label className="form-check-label" htmlFor="enrolledStudents">Include all enrolled students</label>
        </div>

        <h5>Select Grouping Parameters</h5>
        <div className="row">
          <div className="col-md-5">
            <div className="mb-3">
              <label htmlFor="studentsPerGroup" className="form-label">Number of students per group</label>
              <input type="number" id="studentsPerGroup" className="form-control form-control-sm" />
            </div>
            <div className="mb-3">
              <label htmlFor="numberOfGroups" className="form-label">Number of groups</label>
              <input type="number" id="numberOfGroups" className="form-control form-control-sm" />
            </div>
          </div>
          <div className="col-md-5 d-flex flex-column justify-content-start gap-2 pt-2">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="genderBalance" />
              <label className="form-check-label" htmlFor="genderBalance">
                Gender balance<br />
                <small className="text-muted">Ensure gender diversity in each group</small>
              </label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="academicBalance" />
              <label className="form-check-label" htmlFor="academicBalance">
                Academic balance<br />
                <small className="text-muted">Mix different academic performance levels</small>
              </label>
            </div>
          </div>
        </div>

            <div className="mb-3">
            <a href="#advanced" className="text-decoration-none">
                <strong>&#9660; Advanced options</strong>
            </a>
            </div>

            <div className="d-flex justify-content-start button-group">
            <div>
                <button className="btn btn-outline-secondary me-2">Cancel</button>
                <button className="btn btn-outline-primary">Step 1/2</button>
            </div>
            <div>
                <button className="btn btn-outline-secondary me-2">
                <Upload size={16} className="me-1" /> Upload Student Data
                </button>
                <button className="btn btn1">
                Generate groups
                </button>
            </div>
            </div>
        </div>
        </div>
    </div>

  );
};

export default CreateGroups;
