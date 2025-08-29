import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Search,
  Menu,
  X,
  Upload,
  Download,
  Eye,
} from "lucide-react";
import "../Styles/Admin.css";
import axios from "axios";
import * as XLSX from "xlsx";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState({});
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [importedData, setImportedData] = useState([]);

  // Modal states
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form states
  const [lecturerForm, setLecturerForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    departmentId: "",
    password: "",
  });

  const [studentForm, setStudentForm] = useState({
    indexNumber: "",
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    departmentId: "",
    level: "",
  });

  // Bulk upload states
  const [bulkUploadData, setBulkUploadData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    // Check if user is admin
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/dashboard");
      return;
    }

    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        lecturersRes,
        studentsRes,
        groupsRes,
        departmentsRes,
        importedDataRes,
      ] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/lecturers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/groups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/departments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/imported-data", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data);
      setLecturers(lecturersRes.data);
      setStudents(studentsRes.data);
      setGroups(groupsRes.data);
      setDepartments(departmentsRes.data);
      setImportedData(importedDataRes.data);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLecturerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingLecturer) {
        await axios.put(
          `http://localhost:5000/api/admin/lecturers/${editingLecturer.id}`,
          lecturerForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/admin/lecturers",
          lecturerForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowLecturerModal(false);
      setEditingLecturer(null);
      setLecturerForm({
        email: "",
        firstName: "",
        lastName: "",
        departmentId: "",
        password: "",
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save lecturer");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStudent) {
        await axios.put(
          `http://localhost:5000/api/admin/students/${editingStudent.id}`,
          studentForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/admin/students",
          studentForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowStudentModal(false);
      setEditingStudent(null);
      setStudentForm({
        indexNumber: "",
        firstName: "",
        lastName: "",
        gender: "",
        level: "",
        email: "",
        departmentId: "",
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk upload file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and process data
        const headers = data[0];
        const rows = data.slice(1);

        const processedData = rows.map((row, index) => {
          const student = {};
          const headerMap = {
  "index number": "indexNumber",
  "first name": "firstName",
  "last name": "lastName",
  "gender": "gender",
  "level": "level",
  "email": "email",
  "department": "department", // later map department name → id
};

headers.forEach((header, colIndex) => {
  const key = headerMap[header.trim().toLowerCase()];
  if (key && row[colIndex] !== undefined) {
    student[key] = row[colIndex];
  }
});

          student.rowIndex = index + 2; // Excel row number (starting from 2)
          return student;
        });

        setBulkUploadData(processedData);
        setUploadPreview(processedData.slice(0, 5)); // Show first 5 rows as preview
      } catch (error) {
        setError(
          "Error reading file. Please ensure it's a valid Excel/CSV file."
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle bulk upload submission
  const handleBulkUpload = async () => {
    if (bulkUploadData.length === 0) {
      setError("No data to upload");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/students/bulk",
        { students: bulkUploadData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Successfully uploaded ${response.data.uploadedCount} students!`);
      setShowBulkUploadModal(false);
      setBulkUploadData([]);
      setUploadedFile(null);
      setUploadPreview([]);
      loadData();

      // Navigate to students page
      setActiveTab("students");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload students");
    } finally {
      setLoading(false);
    }
  };

  // Download sample template
  const downloadTemplate = () => {
    const template = [
      [
        "Index Number",
        "First Name",
        "Last Name",
        "Gender",
        "Level",
        "Email",
        "Department",
      ],
      [
        "2024001",
        "John",
        "Doe",
        "Male",
        "Level 100",
        "john.doe@example.com",
        "Computer Science",
      ],
      [
        "2024002",
        "Jane",
        "Smith",
        "Female",
        "Level 200",
        "jane.smith@example.com",
        "Mathematics",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students Template");

    XLSX.writeFile(wb, "students_template.xlsx");
  };

  const handleDeleteLecturer = async (lecturerId) => {
    if (!window.confirm("Are you sure you want to delete this lecturer?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/lecturers/${lecturerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lecturer");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/students/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete group");
    }
  };

  const handleDeleteImportedData = async (importId) => {
    if (!window.confirm("Are you sure you want to delete this imported data?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/imported-data/${importId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete imported data");
    }
  };

  const editLecturer = (lecturer) => {
    setEditingLecturer(lecturer);
    setLecturerForm({
      email: lecturer.email,
      firstName: lecturer.first_name,
      lastName: lecturer.last_name,
      departmentId: lecturer.department_id,
      password: "",
    });
    setShowLecturerModal(true);
  };

  const editStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      indexNumber: student.index_number,
      firstName: student.first_name,
      lastName: student.last_name,
      gender: student.gender,
      level: student.level || "",
      email: student.email || "",
      departmentId: student.department_id || "",
    });
    setShowStudentModal(true);
  };

  const openLecturerModal = () => {
    setEditingLecturer(null);
    setLecturerForm({
      email: "",
      firstName: "",
      lastName: "",
      departmentId: "",
      password: "",
    });
    setShowLecturerModal(true);
  };

  const openStudentModal = () => {
    setEditingStudent(null);
    setStudentForm({
      indexNumber: "",
      firstName: "",
      lastName: "",
      gender: "",
      level: "",
      email: "",
      departmentId: "",
    });
    setShowStudentModal(true);
  };

  const openBulkUploadModal = () => {
    setShowBulkUploadModal(true);
    setBulkUploadData([]);
    setUploadedFile(null);
    setUploadPreview([]);
  };

  const filteredLecturers = lecturers.filter((lecturer) => {
    const matchesSearch =
      lecturer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredStudents = students.filter((student) => {
    let matchesSearch =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.index_number.toLowerCase().includes(searchTerm.toLowerCase());

    // Department filter
    if (selectedDepartment && student.department_id != selectedDepartment) {
      matchesSearch = false;
    }

    // Gender filter
    if (selectedGender && student.gender !== selectedGender) {
      matchesSearch = false;
    }


    return matchesSearch;
  });

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading && activeTab === "dashboard") {
    return (
      <div className="admin-page">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h4>Admin Panel</h4>
          <div className="sidebar-header-buttons">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
            >
              Logout
            </button>
            <button
              className="mobile-close-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="sidebar-content">
          <ul className="list-unstyled sidebar-links">
            <li className="mb-2">
              <button
                className={`btn btn-link text-decoration-none ${
                  activeTab === "dashboard" ? "active-link" : ""
                }`}
                onClick={() => {
                  setActiveTab("dashboard");
                  setSidebarOpen(false);
                }}
              >
                <BarChart3 size={18} className="me-2" /> Dashboard
              </button>
            </li>
            <li className="mb-2">
              <button
                className={`btn btn-link text-decoration-none ${
                  activeTab === "lecturers" ? "active-link" : ""
                }`}
                onClick={() => {
                  setActiveTab("lecturers");
                  setSidebarOpen(false);
                }}
              >
                <Users size={18} className="me-2" /> Lecturers
              </button>
            </li>
            <li className="mb-2">
              <button
                className={`btn btn-link text-decoration-none ${
                  activeTab === "students" ? "active-link" : ""
                }`}
                onClick={() => {
                  setActiveTab("students");
                  setSidebarOpen(false);
                }}
              >
                <GraduationCap size={18} className="me-2" /> Students
              </button>
            </li>
            <li className="mb-2">
              <button
                className={`btn btn-link text-decoration-none ${
                  activeTab === "groups" ? "active-link" : ""
                }`}
                onClick={() => {
                  setActiveTab("groups");
                  setSidebarOpen(false);
                }}
              >
                <FolderOpen size={18} className="me-2" /> Groups
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="admin-main-content">
        <div className="admin-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Admin Dashboard</h2>
          </div>

          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
              ></button>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="dashboard-stats">
              <div className="row g-4">
                <div className="col-md-2">
                  <div className="stat-card bg-primary text-white">
                    <div className="stat-icon">
                      <Users size={32} />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.total_lecturers || 0}</h3>
                      <p>Total Lecturers</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="stat-card bg-success text-white">
                    <div className="stat-icon">
                      <GraduationCap size={32} />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.total_students || 0}</h3>
                      <p>Total Students</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="stat-card bg-info text-white">
                    <div className="stat-icon">
                      <FolderOpen size={32} />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.total_groups || 0}</h3>
                      <p>Total Groups</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="stat-card bg-warning text-white">
                    <div className="stat-icon">
                      <BarChart3 size={32} />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.total_courses || 0}</h3>
                      <p>Total Courses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lecturers Tab */}
          {activeTab === "lecturers" && (
            <div className="tab-content">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-3 align-items-center">
                  <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search lecturers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={openLecturerModal}>
                  <Plus size={18} className="me-2" />
                  Add Lecturer
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLecturers.map((lecturer) => (
                      <tr key={lecturer.id}>
                        <td>
                          {lecturer.first_name} {lecturer.last_name}
                        </td>
                        <td>{lecturer.email}</td>
                        <td>{lecturer.department_name}</td>
                        <td>
                          {new Date(lecturer.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => editLecturer(lecturer)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteLecturer(lecturer.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="tab-content">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-3 align-items-center">
                  <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success"
                    onClick={openBulkUploadModal}
                  >
                    <Upload size={18} className="me-2" />
                    Bulk Upload
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={openStudentModal}
                  >
                    <Plus size={18} className="me-2" />
                    Add Student
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="card mb-3">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={selectedDepartment || ""}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={selectedGender || ""}
                        onChange={(e) => setSelectedGender(e.target.value)}
                      >
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedDepartment("");
                          setSelectedGender("");
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Index Number</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{student.index_number}</td>
                        <td>
                          {student.first_name} {student.last_name}
                        </td>
                        <td>{student.gender}</td>
                        <td>{student.email || "-"}</td>
                        <td>{student.department_name || "-"}</td>
                        <td>
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => editStudent(student)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === "groups" && (
            <div className="tab-content">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Students</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.map((group) => (
                      <tr key={group.id}>
                        <td>{group.name}</td>
                        <td>{group.course_name || "-"}</td>
                        <td>
                          {group.lecturer_first_name} {group.lecturer_last_name}
                        </td>
                        <td>{group.student_count}</td>
                        <td>
                          {new Date(group.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lecturer Modal */}
          {showLecturerModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>
                    {editingLecturer ? "Edit Lecturer" : "Add New Lecturer"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLecturerModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleLecturerSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={lecturerForm.firstName}
                          onChange={(e) =>
                            setLecturerForm({
                              ...lecturerForm,
                              firstName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={lecturerForm.lastName}
                          onChange={(e) =>
                            setLecturerForm({
                              ...lecturerForm,
                              lastName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={lecturerForm.email}
                          onChange={(e) =>
                            setLecturerForm({
                              ...lecturerForm,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Department</label>
                        <select
                          className="form-select"
                          value={lecturerForm.departmentId}
                          onChange={(e) =>
                            setLecturerForm({
                              ...lecturerForm,
                              departmentId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {!editingLecturer && (
                        <div className="col-12">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            value={lecturerForm.password}
                            onChange={(e) =>
                              setLecturerForm({
                                ...lecturerForm,
                                password: e.target.value,
                              })
                            }
                            required={!editingLecturer}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowLecturerModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading
                        ? "Saving..."
                        : editingLecturer
                        ? "Update"
                        : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Student Modal */}
          {showStudentModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>{editingStudent ? "Edit Student" : "Add New Student"}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowStudentModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleStudentSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Index Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={studentForm.indexNumber}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              indexNumber: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={studentForm.firstName}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              firstName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={studentForm.lastName}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              lastName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select"
                          value={studentForm.gender}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              gender: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Level</label>
                        <select
                          className="form-select"
                          value={studentForm.level}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              level: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Level</option>
                          <option value="Level 100">Level 100</option>
                          <option value="Level 200">Level 200</option>
                          <option value="Level 300">Level 300</option>
                          <option value="Level 400">Level 400</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={studentForm.email}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Department</label>
                        <select
                          className="form-select"
                          value={studentForm.departmentId}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              departmentId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowStudentModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading
                        ? "Saving..."
                        : editingStudent
                        ? "Update"
                        : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bulk Upload Modal */}
          {showBulkUploadModal && (
            <div className="modal-overlay">
              <div className="modal-content modal-lg">
                <div className="modal-header">
                  <h5>Bulk Upload Students</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowBulkUploadModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <strong>Instructions:</strong>
                        <ul className="mb-0 mt-2">
                          <li>
                            Upload an Excel file (.xlsx) with student data
                          </li>
                          <li>
                            First row should contain headers: Index Number,
                            First Name, Last Name, Gender, Level, Email,
                            Department
                          </li>
                          <li>Email and Department are optional</li>
                          <li>Gender should be: Male, Female, or Other</li>
                          <li>
                            Level should be: Level 100, Level 200, Level 300, or
                            Level 400
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex gap-2 mb-3">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={downloadTemplate}
                        >
                          <Download size={18} className="me-2" />
                          Download Template
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Upload Excel File</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".xlsx,.xls"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>

                    {uploadedFile && (
                      <div className="col-12">
                        <h6>File: {uploadedFile.name}</h6>
                        <p className="text-muted">
                          Found {bulkUploadData.length} students
                        </p>

                        {uploadPreview.length > 0 && (
                          <div className="table-responsive">
                            <table className="table table-sm table-bordered">
                              <thead>
                                <tr>
                                  <th>Row</th>
                                  <th>Index Number</th>
                                  <th>First Name</th>
                                  <th>Last Name</th>
                                  <th>Gender</th>
                                  <th>Level</th>
                                  <th>Email</th>
                                  <th>Department</th>
                                </tr>
                              </thead>
                              <tbody>
                                {uploadPreview.map((student, index) => (
                                  <tr key={index}>
                                    <td>{student.rowindex}</td>
                                    <td>{student.indexnumber}</td>
                                    <td>{student.firstname}</td>
                                    <td>{student.lastname}</td>
                                    <td>{student.gender}</td>
                                    <td>{student.level || "-"}</td>
                                    <td>{student.email || "-"}</td>
                                    <td>{student.department || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {bulkUploadData.length > 5 && (
                              <p className="text-muted">
                                ... and {bulkUploadData.length - 5} more rows
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBulkUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleBulkUpload}
                    disabled={loading || bulkUploadData.length === 0}
                  >
                    {loading
                      ? "Uploading..."
                      : `Upload ${bulkUploadData.length} Students`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
