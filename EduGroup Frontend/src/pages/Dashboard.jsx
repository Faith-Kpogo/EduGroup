import React, { useState, useEffect } from 'react';
import "../Styles/Dashboard.css"
import { Plus, Upload, Download, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import AddTaskModal from '../components/AddTask';
import MainLayout from '../components/MainLayout';
import axios from 'axios';

const Dashboard = () => {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [recentGroups, setRecentGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeGroups: 0,
    recentActivity: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  const userName = localStorage.getItem('userName');

  // ✅ Fetch dashboard stats
  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  // ✅ Fetch recent groups
  const fetchRecentGroups = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:5000/api/groups/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch recent groups:", err);
    }
  };

  // ✅ Fetch upcoming tasks
// ✅ Fetch tasks
const fetchTasks = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await axios.get('http://localhost:5000/api/tasks', {  // 👈 FIXED
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(res.data);
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
  }
};


  // Initial fetch
  useEffect(() => {
    fetchStats();
    fetchRecentGroups();
    fetchTasks();
  }, []);

  return (
    <MainLayout>
      <div className="d-flex flex-column flex-md-row">
        <div className="flex-grow-1 p-4 main-content">
          <h3>Welcome, <span className="name">{userName}</span></h3>

          {/* Dashboard Stats */}
          <div className="data row my-4">
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">{stats.totalStudents}</h5>
                <p className="text-start">Total Students</p>
              </div>
            </div>
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">{stats.activeGroups}</h5>
                <p className="text-start">Active Groups</p>
              </div>
            </div>
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">{stats.recentActivity}</h5>
                <p className="text-start">Recent Activity</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 mb-4">
            <Link className="text-decoration-none" to="/creategroups">
              <button className="btn mainbtn d-flex align-items-center gap-2 ">
                <Plus size={18} />Create New Group
              </button>
            </Link>
            <button className="btn btn2 d-flex align-items-center gap-2">
              <Upload size={18} />Import Data
            </button>
            <button className="btn btn2 d-flex align-items-center gap-2">
              <Download size={18} />Export Data
            </button>
            <button
              className="btn mainbtn d-flex align-items-center gap-2"
              onClick={() => setShowAddTaskModal(true)}
            >
              <ListTodo size={18} />Add Task
            </button>
          </div>

          {/* Recent Groups */}
          <div className="bg-white p-4 rounded shadow-sm">
            <h5>Recent Groups</h5>
            <div className="table-responsive-custom">
              <Table data={recentGroups} />
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="mt-3 bg-light p-3 rounded">
            <strong>Upcoming tasks</strong>
            {tasks.length === 0 ? (
              <p className="mb-0">No pending tasks</p>
            ) : (
              <div className="row g-3 mt-2">
                {tasks.map((task, index) => (
                  <div className="col-md-6" key={index}>
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-1" style={{ fontWeight: 600 }}>
                          {task.title}
                        </h6>
                        <span className="badge mb-2">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        <p className="card-text text-muted" style={{ fontSize: "0.95em" }}>
                          {task.description || <em>No description</em>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onTaskAdded={fetchTasks} // ✅ refresh tasks after adding
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
