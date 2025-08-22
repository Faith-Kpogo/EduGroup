import React, { useState, useEffect } from "react";
import "../Styles/Dashboard.css";
import { Plus, Upload, Download, ListTodo, Trash2, Pencil  } from "lucide-react";
import { Link } from "react-router-dom";
import Table from "../components/Table";
import AddTaskModal from "../components/AddTask";
import MainLayout from "../components/MainLayout";
import axios from "axios";
import EditTaskModal from "../components/EditTaskModal";


const Dashboard = () => {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [recentGroups, setRecentGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeGroups: 0,
    recentActivity: 0,
  });
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); 



  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  const userName = localStorage.getItem("userName");

  // ✅ Fetch dashboard stats
  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  // ✅ Fetch recent groups
  const fetchRecentGroups = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/groups/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch recent groups:", err);
    }
  };

  // ✅ Fetch upcoming tasks
  // ✅ Fetch tasks
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        // 👈 FIXED
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t.id !== taskId));
      setConfirmDelete(null);
      // ✅ Refresh tasks after deletion
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
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
          <h3>
            Welcome, <span className="name">{userName}</span>
          </h3>

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
                <Plus size={18} />
                Create New Group
              </button>
            </Link>
            <button className="btn btn2 d-flex align-items-center gap-2">
              <Upload size={18} />
              Import Data
            </button>
            <button className="btn btn2 d-flex align-items-center gap-2">
              <Download size={18} />
              Export Data
            </button>
            <button
              className="btn mainbtn d-flex align-items-center gap-2"
              onClick={() => setShowAddTaskModal(true)}
            >
              <ListTodo size={18} />
              Add Task
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
            <h5>Upcoming tasks</h5>
            {tasks.length === 0 ? (
              <p className="mb-0">No pending tasks</p>
            ) : (
              <div className="row g-3 mt-2">
                {tasks.map((task, index) => (
                  <div className="col-md-6" key={index}>
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body d-flex flex-column justify-content-between">
                        {/* Task Title + Due Date */}
                        <div>
                          <h6 className="card-title mb-1 fw-semibold">
                            {task.title}
                          </h6>
                          <span className="badge mb-2">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                          <p className="card-text text-muted small">
                            {task.description || <em>No description</em>}
                          </p>
                        </div>
                        <button
                          className="btn btn-sm btn-light text-primary border-0 d-flex align-items-center justify-content-center"
                          style={{
                            borderRadius: "50%",
                            width: "34px",
                            height: "34px",
                          }}
                          onClick={() => setEditingTask(task)}
                          title="Edit Task"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* Delete Button (Trash Icon) */}
                        <div className="d-flex justify-content-end">
                          <button
                            className="btn btn-sm btn-light text-danger border-0 d-flex align-items-center justify-content-center"
                            style={{
                              borderRadius: "50%",
                              width: "34px",
                              height: "34px",
                            }}
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete Task"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onTaskUpdated={fetchTasks}
      />
    </MainLayout>

    
  );
};

export default Dashboard;
