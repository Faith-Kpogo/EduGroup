import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import '../Styles/CreateGroups.css';
import MainLayout from '../components/MainLayout';
import '../App.css';
import axios from "axios";
import { useToast } from '../components/Toast';

const CreateGroups = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keepTogether, setKeepTogether] = useState(false);
  const [studentsTogether, setStudentsTogether] = useState([]);
  const [newStudent, setNewStudent] = useState('');
  const [distribution, setDistribution] = useState('');

  // ✅ Form states
  const [level, setLevel] = useState("");
  const [courseId, setCourseId] = useState("");
  const [studentsPerGroup, setStudentsPerGroup] = useState("");
  const [numberOfGroups, setNumberOfGroups] = useState("");
  const [genderBalance, setGenderBalance] = useState(false);
  const [academicBalance, setAcademicBalance] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [importedFileName, setImportedFileName] = useState("");


  // ✅ Feedback states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Courses state
  const [courses, setCourses] = useState([]);

  // Pick up last import metadata
  useEffect(() => {
    const storedCourseId = localStorage.getItem("importedCourseId");
    const storedFileName = localStorage.getItem("importedFileName");
    if (storedCourseId) {
      setCourseId(storedCourseId);
    }
    if (storedFileName) setImportedFileName(storedFileName);
  }, []);

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
        if (!res.data.find(c => String(c.id) === String(courseId))) {
          // keep imported id if present
          const storedCourseId = localStorage.getItem("importedCourseId");
          if (storedCourseId && res.data.find(c => String(c.id) === String(storedCourseId))) {
            setCourseId(storedCourseId);
          } else {
            setCourseId("");
          }
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

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!courseId) newErrors.courseId = "Please select a course.";
    if (!studentsPerGroup && !numberOfGroups) {
      newErrors.grouping = "Provide either students per group or number of groups.";
    }
    if (studentsPerGroup && studentsPerGroup <= 0) {
      newErrors.studentsPerGroup = "Must be greater than 0.";
    }
    if (numberOfGroups && numberOfGroups <= 0) {
      newErrors.numberOfGroups = "Must be greater than 0.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Call backend
  const handleGenerateGroups = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }

    if (!courseId) {
      toast.warning("Please select a course before generating groups.");
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
          distributionMethod: distribution || "random",
          keepTogether: keepTogether ? studentsTogether : null
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Send data to preview page
      navigate(`/previewgroups/${res.data.batchId}`);
    } catch (err) {
      console.error("Error generating groups:", err);
      toast.error(err.response?.data?.message || "Failed to generate groups");
    }
  };

  useEffect(() => {
  const fetchStudents = async () => {
    if (!courseId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllStudents(res.data); // should return [{id, index_number, first_name, last_name}, ...]
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };
  fetchStudents();
}, [courseId]);

// Search handler
useEffect(() => {
  const fetchStudents = async () => {
    if (!courseId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };
  fetchStudents();
}, [courseId]);

// search input handler
const handleSearchChange = (e) => {
  const value = e.target.value;
  setNewStudent(value);

  if (value.trim() === "") {
    setSearchResults([]);
    return;
  }

  // match by index_number OR first/last name
  const matches = allStudents.filter(
    (s) =>
      s.index_number.toLowerCase().includes(value.toLowerCase()) ||
      s.first_name.toLowerCase().includes(value.toLowerCase()) ||
      s.last_name.toLowerCase().includes(value.toLowerCase())
  );

  setSearchResults(matches);
};

// select a student from dropdown
const handleSelectStudent = (student) => {
  if (!studentsTogether.includes(student.index_number)) {
    setStudentsTogether([...studentsTogether, student.index_number]);
  }
  setNewStudent("");
  setSearchResults([]);
};

  // ✅ Import CSV without selecting a course
  const handleUploadData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls";
    input.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const form = new FormData();
        form.append("file", file);
        const res = await axios.post("http://localhost:5000/api/courses/import", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // store metadata and preselect course
        localStorage.setItem("importedCourseId", String(res.data.courseId));
        localStorage.setItem("importedCourseName", res.data.courseName || "Imported Course");
        localStorage.setItem("importedFileName", file.name);
        setImportedFileName(file.name);
        setCourseId(String(res.data.courseId));
        toast.success("File imported. Course selected automatically.");
      } catch (err) {
        console.error("Import failed:", err);
        toast.error("Import failed. Ensure CSV/Excel is valid.");
      }
    };
    input.click();
  };

  // ✅ Clear imported file
  const handleClearImportedFile = () => {
    localStorage.removeItem("importedCourseId");
    localStorage.removeItem("importedCourseName");
    localStorage.removeItem("importedFileName");
    setImportedFileName("");
    setCourseId("");
    toast.success("Imported file cleared");
  };

  return (
    <MainLayout>
      <div className="d-flex">
        <div className="main p-4 flex-grow-1">
          <h3>Create Groups</h3>
          <p className="text-muted">Define parameters for generating balanced student groups</p>

          <div className="create-groups-container bg-white p-4 rounded shadow-sm">
            {errors.general && (
              <div className="alert alert-danger py-2">{errors.general}</div>
            )}

            {/* Imported file info */}
            {importedFileName && (
              <div className="alert alert-info py-2 mb-3 d-flex justify-content-between align-items-center">
                <span>Imported file: {importedFileName}</span>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClearImportedFile}
                  title="Clear imported file"
                ></button>
              </div>
            )}

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
                    <option value="">Select Level</option>
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
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                  {errors.courseId && (
                    <div className="text-danger small mt-1">{errors.courseId}</div>
                  )}
                </div>
              </div>
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
                  {errors.studentsPerGroup && (
                    <div className="text-danger small mt-1">{errors.studentsPerGroup}</div>
                  )}
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
                  {errors.numberOfGroups && (
                    <div className="text-danger small mt-1">{errors.numberOfGroups}</div>
                  )}
                </div>
                {errors.grouping && (
                  <div className="text-danger small mt-1">{errors.grouping}</div>
                )}
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
  <div className="mb-3 position-relative">
    <div className="d-flex gap-2 mb-2">
      <input
        type="text"
        className="form-control"
        placeholder="Type index number or name..."
        value={newStudent}
        onChange={handleSearchChange}   // ✅ now triggers live search
      />
    </div>

    {/* Suggestions dropdown */}
    {searchResults.length > 0 && (
      <ul
        className="list-group position-absolute w-100"
        style={{ zIndex: 1000, maxHeight: "150px", overflowY: "auto" }}
      >
        {searchResults.map((s) => (
          <li
            key={s.id}
            className="list-group-item list-group-item-action"
            onClick={() => handleSelectStudent(s)}  // ✅ select student
            style={{ cursor: "pointer" }}
          >
            <strong>{s.index_number}</strong> – {s.first_name} {s.last_name}
          </li>
        ))}
      </ul>
    )}

    {/* Selected students */}
    <div className="d-flex flex-wrap gap-2 mt-2">
      {studentsTogether.map((student, index) => (
        <span key={index} className="badge bg-secondary">
          {student}{" "}
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
                <button className="btn btn-outline-secondary me-2" onClick={handleUploadData} disabled={loading}>
                  <Upload size={16} className="me-1" /> Upload Student Data
                </button>
                <button className="btn mainbtn" onClick={handleGenerateGroups} disabled={loading}>
                  {loading ? "Generating..." : "Generate groups"}
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
