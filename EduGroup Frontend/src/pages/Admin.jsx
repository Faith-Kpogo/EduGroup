import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3,
  Search
} from 'lucide-react';
import '../Styles/Admin.css';
import axios from "axios";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [stats, setStats] = useState({});
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modal states
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form states
  const [lecturerForm, setLecturerForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    departmentId: '',
    password: ''
  });

  const [studentForm, setStudentForm] = useState({
    indexNumber: '',
    firstName: '',
    lastName: '',
    gender: '',
    email: ''
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      navigate('/dashboard');
      return;
    }
    
    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, lecturersRes, studentsRes, groupsRes, departmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/lecturers', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/students', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/groups', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats(statsRes.data);
      setLecturers(lecturersRes.data);
      setStudents(studentsRes.data);
      setGroups(groupsRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
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
          'http://localhost:5000/api/admin/lecturers',
          lecturerForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setShowLecturerModal(false);
      setEditingLecturer(null);
      setLecturerForm({ email: '', firstName: '', lastName: '', departmentId: '', password: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lecturer');
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
          'http://localhost:5000/api/admin/students',
          studentForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setShowStudentModal(false);
      setEditingStudent(null);
      setStudentForm({ indexNumber: '', firstName: '', lastName: '', gender: '', email: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecturer = async (lecturerId) => {
    if (!window.confirm('Are you sure you want to delete this lecturer?')) return;
    
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/lecturers/${lecturerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lecturer');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/students/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/groups/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const editLecturer = (lecturer) => {
    setEditingLecturer(lecturer);
    setLecturerForm({
      email: lecturer.email,
      firstName: lecturer.first_name,
      lastName: lecturer.last_name,
      departmentId: lecturer.department_id,
      password: ''
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
      email: student.email || ''
    });
    setShowStudentModal(true);
  };

  const openLecturerModal = () => {
    setEditingLecturer(null);
    setLecturerForm({ email: '', firstName: '', lastName: '', departmentId: '', password: '' });
    setShowLecturerModal(true);
  };

  const openStudentModal = () => {
    setEditingStudent(null);
    setStudentForm({ indexNumber: '', firstName: '', lastName: '', gender: '', email: '' });
    setShowStudentModal(true);
  };

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = lecturer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecturer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecturer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lecturer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.index_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="admin-page">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h4>Admin Panel</h4>
          <button 
            className="btn btn-outline-light btn-sm"
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
          >
            Logout
          </button>
        </div>
        <div className="sidebar-content">
          <ul className="list-unstyled sidebar-links">
            <li className="mb-2">
              <button 
                className={`btn btn-link text-decoration-none ${activeTab === 'dashboard' ? 'active-link' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart3 size={18} className="me-2" /> Dashboard
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`btn btn-link text-decoration-none ${activeTab === 'lecturers' ? 'active-link' : ''}`}
                onClick={() => setActiveTab('lecturers')}
              >
                <Users size={18} className="me-2" /> Lecturers
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`btn btn-link text-decoration-none ${activeTab === 'students' ? 'active-link' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                <GraduationCap size={18} className="me-2" /> Students
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`btn btn-link text-decoration-none ${activeTab === 'groups' ? 'active-link' : ''}`}
                onClick={() => setActiveTab('groups')}
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
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={async () => {
                try {
                  const response = await axios.post('http://localhost:5000/api/admin/sample-data', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  alert('Sample data created successfully!');
                  loadData();
                } catch (err) {
                  alert('Error creating sample data: ' + (err.response?.data?.message || err.message));
                }
              }}
            >
              Create Sample Data
            </button>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-stats">
              <div className="row g-4">
                <div className="col-md-3">
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
                <div className="col-md-3">
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
                <div className="col-md-3">
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
                <div className="col-md-3">
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
          {activeTab === 'lecturers' && (
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
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLecturers.map(lecturer => (
                      <tr key={lecturer.id}>
                        <td>{lecturer.first_name} {lecturer.last_name}</td>
                        <td>{lecturer.email}</td>
                        <td>{lecturer.department_name}</td>
                        <td>
                          <span className={`badge bg-${lecturer.status === 'active' ? 'success' : 'secondary'}`}>
                            {lecturer.status}
                          </span>
                        </td>
                        <td>{new Date(lecturer.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => editLecturer(lecturer)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleDeleteLecturer(lecturer.id)}>
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
          {activeTab === 'students' && (
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
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={openStudentModal}>
                  <Plus size={18} className="me-2" />
                  Add Student
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Index Number</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.id}>
                        <td>{student.index_number}</td>
                        <td>{student.first_name} {student.last_name}</td>
                        <td>{student.gender}</td>
                        <td>{student.email || '-'}</td>
                        <td>
                          <span className={`badge bg-${student.status === 'active' ? 'success' : 'secondary'}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>{new Date(student.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => editStudent(student)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleDeleteStudent(student.id)}>
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
          {activeTab === 'groups' && (
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
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.map(group => (
                      <tr key={group.id}>
                        <td>{group.name}</td>
                        <td>{group.course_name || '-'}</td>
                        <td>{group.lecturer_first_name} {group.lecturer_last_name}</td>
                        <td>{group.student_count}</td>
                        <td>
                          <span className={`badge bg-${group.status === 'Active' ? 'success' : 'secondary'}`}>
                            {group.status}
                          </span>
                        </td>
                        <td>{new Date(group.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteGroup(group.id)}>
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
                  <h5>{editingLecturer ? 'Edit Lecturer' : 'Add New Lecturer'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowLecturerModal(false)}></button>
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
                          onChange={(e) => setLecturerForm({...lecturerForm, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={lecturerForm.lastName}
                          onChange={(e) => setLecturerForm({...lecturerForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={lecturerForm.email}
                          onChange={(e) => setLecturerForm({...lecturerForm, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Department</label>
                        <select
                          className="form-select"
                          value={lecturerForm.departmentId}
                          onChange={(e) => setLecturerForm({...lecturerForm, departmentId: e.target.value})}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
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
                            onChange={(e) => setLecturerForm({...lecturerForm, password: e.target.value})}
                            required={!editingLecturer}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowLecturerModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : (editingLecturer ? 'Update' : 'Create')}
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
                  <h5>{editingStudent ? 'Edit Student' : 'Add New Student'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowStudentModal(false)}></button>
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
                          onChange={(e) => setStudentForm({...studentForm, indexNumber: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={studentForm.firstName}
                          onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={studentForm.lastName}
                          onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select"
                          value={studentForm.gender}
                          onChange={(e) => setStudentForm({...studentForm, gender: e.target.value})}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Email (Optional)</label>
                        <input
                          type="email"
                          className="form-control"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : (editingStudent ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
