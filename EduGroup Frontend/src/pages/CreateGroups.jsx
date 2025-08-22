import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import '../Styles/CreateGroups.css';
import MainLayout from '../components/MainLayout';
import '../App.css';
import axios from "axios";

const CreateGroups = () => {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allowUneven, setAllowUneven] = useState(false);
  const [keepTogether, setKeepTogether] = useState(false);
  const [studentsTogether, setStudentsTogether] = useState([]);
  const [newStudent, setNewStudent] = useState('');
  const [distribution, setDistribution] = useState('');

  // ✅ Form states
  const [level, setLevel] = useState(""); // 👈 NEW
  const [courseId, setCourseId] = useState("");
  const [studentsPerGroup, setStudentsPerGroup] = useState("");
  const [numberOfGroups, setNumberOfGroups] = useState("");
  const [genderBalance, setGenderBalance] = useState(false);
  const [academicBalance, setAcademicBalance] = useState(false);

  // ✅ Courses state
const [courses, setCourses] = useState([]);


  // Fetch courses whenever level changes
// Fetch courses whenever level changes
useEffect(() => {
  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let url = "http://localhost:5000/api/courses";
      if (level) {
        url += `?level=${level}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourses(res.data);

      // Reset courseId only if previously selected course doesn't exist
      if (!res.data.find(c => c.id === courseId)) {
        setCourseId("");
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]); // reset on error
    }
  };

  fetchCourses();
}, [level]);





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

  // ✅ Call backend
  const handleGenerateGroups = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/groups/generate",
        {
          courseId,
          studentsPerGroup: studentsPerGroup ? parseInt(studentsPerGroup) : null,
          numberOfGroups: numberOfGroups ? parseInt(numberOfGroups) : null,
          genderBalance,
          academicBalance,
          distributionMethod: distribution || "random"
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Groups generated successfully!");
      console.log(res.data);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error generating groups:", err);
      alert("Failed to generate groups");
    }
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
              {/* Level Dropdown */}
              <div className="col-5">
                <div className="mb-2">
                  <label htmlFor="level" className="form-label">Level</label>
                  <select
                    id="level"
                    className="form-select form-select-sm"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="">-- Select Level --</option>
                    <option value="100">Level 100</option>
                    <option value="200">Level 200</option>
                    <option value="300">Level 300</option>
                    <option value="400">Level 400</option>
                  </select>
                </div>
              </div>

              {/* Course Dropdown */}
              <div className="col-5 ms-auto">
                <div className="mb-2">
                  <label htmlFor="course" className="form-label">Course</label>
                  <select
                    id="course"
                    className="form-select form-select-sm"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-check mb-4 ps-0">
              <input type="checkbox" className="checkInput ms-0" id="enrolledStudents" />
              <label className="form-check-label" htmlFor="enrolledStudents">Include all enrolled students</label>
            </div>

            {/* Grouping Parameters */}
            <h5>Select Grouping Parameters</h5>
            <div className="row">
              <div className="col-5">
                <div className="mb-3">
                  <label htmlFor="studentsPerGroup" className="form-label">Number of students per group</label>
                  <input
                    type="number"
                    id="studentsPerGroup"
                    className="form-control form-control-sm"
                    value={studentsPerGroup}
                    onChange={(e) => setStudentsPerGroup(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="numberOfGroups" className="form-label">Number of groups</label>
                  <input
                    type="number"
                    id="numberOfGroups"
                    className="form-control form-control-sm"
                    value={numberOfGroups}
                    onChange={(e) => setNumberOfGroups(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-5 d-flex flex-column justify-content-start gap-2 pt-2 ms-auto">
                <div className="form-check ps-0">
                  <input
                    type="checkbox"
                    className="checkInput"
                    id="genderBalance"
                    checked={genderBalance}
                    onChange={() => setGenderBalance(!genderBalance)}
                  />
                  <label className="form-check-label right-input" htmlFor="genderBalance">
                    Gender balance<br />
                    <small className="text-muted">Ensure gender diversity in each group</small>
                  </label>
                </div>
                <div className="form-check ps-0">
                  <input
                    type="checkbox"
                    className="checkInput"
                    id="academicBalance"
                    checked={academicBalance}
                    onChange={() => setAcademicBalance(!academicBalance)}
                  />
                  <label className="form-check-label right-input" htmlFor="academicBalance">
                    Academic balance<br />
                    <small className="text-muted">Mix academic performance levels</small>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
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
                <button className="btn btn-outline-secondary me-2" onClick={() => navigate("/dashboard")}>Cancel</button>
                <button className="btn btn-outline-primary cursor-none">Step 1/2</button>
              </div>
              <div className='d-flex gap-2 ms-auto'>
                <button className="btn btn-outline-secondary me-2">
                  <Upload size={16} className="me-1" /> Upload Student Data
                </button>
                <button className="btn mainbtn" onClick={handleGenerateGroups}>
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
