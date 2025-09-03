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
  Layers,
  BookOpen,
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
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { useToast } from "../components/Toast";

const Admin = () => {
  const toast = useToast();
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
  const [importedData, setImportedData] = useState([]);

  // Modal states
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  // Departments
  // Departments
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const [filterDept, setFilterDept] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  // Courses
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseDept, setNewCourseDept] = useState("");
  const [newCourseLevel, setNewCourseLevel] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ type: "", id: null });

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
        coursesRes,
      ] = await Promise.all([
        axios.get("https://edugroup.onrender.comapi/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://edugroup.onrender.comapi/admin/lecturers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://edugroup.onrender.comapi/admin/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://edugroup.onrender.comapi/admin/groups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://edugroup.onrender.comapi/admin/departments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://edugroup.onrender.comapi/admin/imported-data", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://edugroup.onrender.comapi/admin/courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data);
      setLecturers(lecturersRes.data);
      setStudents(studentsRes.data);
      setGroups(groupsRes.data);
      setDepartments(departmentsRes.data);
      setImportedData(importedDataRes.data);
      setCourses(coursesRes.data);
      console.log(
        "Course levels:",
        coursesRes.data.map((c) => c.level)
      );
      console.log(
        "Course level types:",
        coursesRes.data.map((c) => typeof c.level)
      );
      console.log("Courses:", coursesRes.data); // 🔎 inspect levels here
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
          `https://edugroup.onrender.comapi/admin/lecturers/${editingLecturer.id}`,
          lecturerForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "https://edugroup.onrender.comapi/admin/lecturers",
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
          `https://edugroup.onrender.comapi/admin/students/${editingStudent.id}`,
          studentForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "https://edugroup.onrender.comapi/admin/students",
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
            gender: "gender",
            level: "level",
            email: "email",
            department: "department", // later map department name → id
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
        "https://edugroup.onrender.comapi/admin/students/bulk",
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

  const handleDeleteLecturer = (lecturerId) => {
    console.log("Delete clicked for lecturer:", lecturerId); // <-- debug
    setDeleteConfig({ type: "lecturer", id: lecturerId });
    setShowDeleteModal(true);
  };

  const handleDeleteStudent = (studentId) => {
    setDeleteConfig({ type: "student", id: studentId });
    setShowDeleteModal(true);
  };

  const handleDeleteGroup = (groupId) => {
    setDeleteConfig({ type: "group", id: groupId });
    setShowDeleteModal(true);
  };

  const handleDeleteImportedData = (importId) => {
    setDeleteConfig({ type: "imported", id: importId });
    setShowDeleteModal(true);
  };
  // ✅ Departments
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDept.trim() || !newDeptCode.trim()) return;

    try {
      await axios.post(
        "https://edugroup.onrender.comapi/admin/departments",
        { name: newDept, code: newDeptCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewDept("");
      setNewDeptCode("");
      setShowDeptModal(false); // ✅ close modal
      toast.success("Department added successfully");
      loadData();
    } catch (err) {
      console.error("Error adding department:", err);
      toast.error(err.response?.data?.message || "Failed to add department");
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await axios.delete(`https://edugroup.onrender.comapi/admin/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      console.error("Error deleting department:", err);
      setError(err.response?.data?.message || "Failed to delete department");
    }
  };

  // ✅ Courses
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (
      !newCourseName.trim() ||
      !newCourseCode.trim() ||
      !newCourseLevel.trim()
    )
      return;

    try {
      await axios.post(
        "https://edugroup.onrender.comapi/admin/courses",
        {
          courseName: newCourseName,
          courseCode: newCourseCode,
          departmentId: newCourseDept || null,
          level: parseInt(newCourseLevel, 10), // ✅ ensure numeric
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCourseName("");
      setNewCourseCode("");
      setNewCourseDept("");
      setNewCourseLevel("");
      setShowCourseModal(false); // ✅ close modal
      toast.success("Course added successfully");
      loadData();
    } catch (err) {
      console.error("Error adding course:", err);
      toast.error(err.response?.data?.message || "Failed to add course");
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await axios.delete(`https://edugroup.onrender.comapi/admin/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      console.error("Error deleting course:", err);
      setError(err.response?.data?.message || "Failed to delete course");
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

  const confirmDelete = async () => {
    if (!deleteConfig.id) return;
    setLoading(true);

    try {
      if (deleteConfig.type === "lecturer") {
        await axios.delete(
          `https://edugroup.onrender.comapi/admin/lecturers/${deleteConfig.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (deleteConfig.type === "student") {
        await axios.delete(
          `https://edugroup.onrender.comapi/admin/students/${deleteConfig.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (deleteConfig.type === "group") {
        await axios.delete(
          `https://edugroup.onrender.comapi/admin/groups/${deleteConfig.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (deleteConfig.type === "imported") {
        await axios.delete(
          `https://edugroup.onrender.comapi/admin/imported-data/${deleteConfig.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Show success banner instead of alert
      setError("");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
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

            {/* ✅ New Departments link */}
            <li className="mb-2">
              <button
                className={`btn btn-link text-decoration-none ${
                  activeTab === "departments" ? "active-link" : ""
                }`}
                onClick={() => {
                  setActiveTab("departments");
                  setSidebarOpen(false);
                }}
              >
                <Layers size={18} className="me-2" /> Departments
              </button>
            </li>

            {/* ✅ New Courses link */}
            <li className="mb-2">
              <button
                className={`btn btn-link text-decoration-none ${
                  activeTab === "courses" ? "active-link" : ""
                }`}
                onClick={() => {
                  setActiveTab("courses");
                  setSidebarOpen(false);
                }}
              >
                <BookOpen size={18} className="me-2" /> Courses
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
                <div className="col-md-3 col-sm-6">
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

                <div className="col-md-3 col-sm-6">
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

                <div className="col-md-3 col-sm-6">
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

                <div className="col-md-3 col-sm-6">
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

          {activeTab === "departments" && (
            <div>
              <h3>Departments</h3>
              <button
                className="btn btn-primary mb-3"
                onClick={() => setShowDeptModal(true)}
              >
                + Add Department
              </button>

              <ul className="list-group">
                {departments.map((d) => (
                  <li
                    key={d.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {d.name} ({d.code})
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteDepartment(d.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "courses" && (
            <div>
              <h3>Courses</h3>

              {/* Add button */}
              <button
                className="btn btn-primary mb-3"
                onClick={() => setShowCourseModal(true)}
              >
                + Add Course
              </button>

              {/* Filters */}
              {/* Search & Filters */}
              <div className="d-flex gap-3 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="form-select"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  className="form-select"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="">All Levels</option>
                  {[100, 200, 300, 400].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtered table */}
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Level</th>
                    <th>Department</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    .filter((c) =>
                      filterDept
                        ? String(c.department_id) === String(filterDept)
                        : true
                    )
                    .filter((c) =>
                      filterLevel
                        ? String(c.level) === String(filterLevel)
                        : true
                    )
                    .filter((c) =>
                      searchTerm
                        ? c.course_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          c.course_code
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        : true
                    )
                    .map((c) => (
                      <tr key={c.id}>
                        <td>{c.course_name}</td>
                        <td>{c.course_code}</td>
                        <td>{c.level}</td>
                        <td>{c.department_name || "—"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteCourse(c.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
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

          {/* 🔥 Department Add Modal */}
          {showDeptModal && (
            <div className="modal-backdrop">
              <div
                className="modal-content bg-white p-4 rounded shadow-sm"
                style={{ width: "400px", margin: "10% auto" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Add Department</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowDeptModal(false)}
                  ></button>
                </div>

                <form onSubmit={handleAddDepartment}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Department name"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Department code"
                      value={newDeptCode}
                      onChange={(e) => setNewDeptCode(e.target.value)}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowDeptModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 🔥 Course Add Modal */}
          {showCourseModal && (
            <div className="modal-backdrop">
              <div
                className="modal-content bg-white p-4 rounded shadow-sm"
                style={{ width: "500px", margin: "5% auto" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Add Course</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowCourseModal(false)}
                  ></button>
                </div>

                <form onSubmit={handleAddCourse}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Course name"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Course code"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <select
                      className="form-select"
                      value={newCourseDept}
                      onChange={(e) => setNewCourseDept(e.target.value)}
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Level"
                      value={newCourseLevel}
                      onChange={(e) => setNewCourseLevel(e.target.value)}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCourseModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="This action cannot be undone. Do you really want to delete?"
        loading={loading}
      />
    </div>
  );
};

export default Admin;
