import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import '../Styles/CreateGroups.css';
import MainLayout from '../components/MainLayout';
import '../App.css';

const CreateGroups = () => {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allowUneven, setAllowUneven] = useState(false);
  const [keepTogether, setKeepTogether] = useState(false);
  const [studentsTogether, setStudentsTogether] = useState([]);
  const [newStudent, setNewStudent] = useState('');
  const [distribution, setDistribution] = useState('');

  const handleAddStudent = () => {
    if (newStudent.trim() !== '') {
      setStudentsTogether([...studentsTogether, newStudent.trim()]);
      setNewStudent('');
    }
  };

  const handleRemoveStudent = (index) => {
    const updated = [...studentsTogether];
    updated.splice(index, 1);
    setStudentsTogether(updated);
  };

  return (
    <MainLayout>
      <div className="d-flex">
        <div className="main p-4 flex-grow-1">
          <h3>Create Groups</h3>
          <p className="text-muted">Define parameters for generating balanced student groups</p>

          <div className="create-groups-container bg-white p-4 rounded shadow-sm">
            <h5>Select Course and Students</h5>
            <div className="row mb-3 gap-5">
              <div className="col-5">
                <div className="mb-2">
                  <label htmlFor="course" className="form-label">Course</label>
                  <select id="course" className="form-select form-select-sm">
                    <option>INF 402</option>
                  </select>
                </div>
              </div>
              <div className="col-5 ms-auto">
                <div className="mb-2">
                  <label htmlFor="section" className="form-label">Section</label>
                  <select id="section" className="form-select form-select-sm">
                    <option>All Sections</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-check mb-4 ps-0">
              <input type="checkbox" className="checkInput ms-0" id="enrolledStudents" />
              <label className="form-check-label" htmlFor="enrolledStudents">Include all enrolled students</label>
            </div>

            <h5>Select Grouping Parameters</h5>
            <div className="row">
              <div className="col-5">
                <div className="mb-3">
                  <label htmlFor="studentsPerGroup" className="form-label">Number of students per group</label>
                  <input type="number" id="studentsPerGroup" className="form-control form-control-sm" />
                </div>
                <div className="mb-3">
                  <label htmlFor="numberOfGroups" className="form-label">Number of groups</label>
                  <input type="number" id="numberOfGroups" className="form-control form-control-sm" />
                </div>
              </div>
              <div className="col-5 d-flex flex-column justify-content-start gap-2 pt-2 ms-auto">
                <div className="form-check ps-0">
                  <input type="checkbox" className="checkInput"  id="genderBalance" />
                  <label className="form-check-label right-input" htmlFor="genderBalance">
                    Gender balance<br />
                    <small className="text-muted">Ensure gender diversity in each group</small>
                  </label>
                </div>
                <div className="form-check ps-0">
                  <input type="checkbox" className="checkInput" id="academicBalance" />
                  <label className="form-check-label right-input" htmlFor="academicBalance">
                    Academic balance<br />
                    <small className="text-muted">Mix academic performance levels</small>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-link text-decoration-none p-0"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <strong>{showAdvanced ? '▲ Hide advanced options' : '▼ Advanced options'}</strong>
              </button>
            </div>

            {showAdvanced && (
              <div className="advanced-options border-top pt-3 mt-3">
                {/* Uneven sizes */}
                <div className="form-check mb-2 ps-0">
                  <input
                    type="checkbox"
                    className="checkInput"
                    id="allowUneven"
                    checked={allowUneven}
                    onChange={() => setAllowUneven(!allowUneven)}
                  />
                  <label htmlFor="allowUneven" className="form-check-label">
                    Allow uneven group sizes if needed
                  </label>
                </div>

                {/* Keep together */}
                <div className="form-check mb-2 ps-0">
                  <input
                    type="checkbox"
                    className="checkInput"
                    id="keepTogether"
                    checked={keepTogether}
                    onChange={() => setKeepTogether(!keepTogether)}
                  />
                  <label htmlFor="keepTogether" className="form-check-label">
                    Keep specific students together
                  </label>
                </div>

                {keepTogether && (
                  <div className="mb-3">
                    <div className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add student"
                        value={newStudent}
                        onChange={(e) => setNewStudent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                      />
                      <button className="btn btn-outline-primary" onClick={handleAddStudent}>Add</button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {studentsTogether.map((student, index) => (
                        <span key={index} className="badge bg-secondary">
                          {student}{' '}
                          <button
                            type="button"
                            className="btn-close btn-close-white btn-sm ms-1"
                            onClick={() => handleRemoveStudent(index)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Distribution method */}
                <div className="mb-3">
                  <label className="form-label">Distribution method</label>
                  <select
                    className="form-select"
                    value={distribution}
                    onChange={(e) => setDistribution(e.target.value)}
                  >
                    <option value="">Select a method</option>
                    <option value="balance">Optimize for balance across all criteria</option>
                    <option value="academic">Prioritize academic balance</option>
                    <option value="gender">Prioritize gender balance</option>
                    <option value="random">Completely random distribution</option>
                  </select>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="d-flex justify-content-start button-group mt-3">
              <div className='d-flex gap-2'>
                <button className="btn btn-outline-secondary me-2">Cancel</button>
                <button className="btn btn-outline-primary cursor-none">Step 1/2</button>
              </div>
              <div className='d-flex gap-2 ms-auto'>
                <button className="btn btn-outline-secondary me-2">
                  <Upload size={16} className="me-1" /> Upload Student Data
                </button>
                <button className="btn mainbtn">
                  Generate groups
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateGroups;
