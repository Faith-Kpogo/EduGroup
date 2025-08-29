// Dashboard.jsx
import React, { useState, useEffect } from "react";
import "../Styles/Dashboard.css";
import { Plus, Upload, ListTodo, Trash2, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
    departmentStudents: 0,
    activeGroups: 0,
    groupedStudents: 0,
  });
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deletingTask, setDeletingTask] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  const userName = localStorage.getItem("userName");
  const firstName = userName ? userName.split(' ')[0] : '';
  const navigate = useNavigate();

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

  // ✅ Fetch tasks
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
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

    try {
      setDeletingTask(true);
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t.id !== taskId));
      setShowDeleteTaskModal(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    } finally {
      setDeletingTask(false);
    }
  };

  // ✅ Import CSV/Excel (no course) then redirect to Create Groups
  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls";
    input.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // First, read the file to get the data
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            // Parse the file data (you'll need to implement this based on file type)
            let data = [];
            if (file.name.endsWith('.csv')) {
              // Parse CSV
              const csvText = event.target.result;
              const lines = csvText.split('\n');
              const headers = lines[0].split(',').map(h => h.trim());
              data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const row = {};
                headers.forEach((header, index) => {
                  row[header] = values[index] || '';
                });
                return row;
              }).filter(row => Object.values(row).some(v => v !== ''));
            } else {
              // For Excel files, you might want to use a library like XLSX
              // For now, we'll store the raw text
              data = [{ rawData: event.target.result }];
            }

            // Store the imported data
            const userId = localStorage.getItem("userId");
            const storeRes = await axios.post("http://localhost:5000/api/admin/imported-data/store", {
              fileName: file.name,
              data: data,
              userId: userId
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            // Save import metadata
            localStorage.setItem("importedDataId", String(storeRes.data.importId));
            localStorage.setItem("importedFileName", file.name);

            // Go to Create Groups to choose parameters
            navigate("/creategroups");
          } catch (parseErr) {
            console.error("File parsing failed:", parseErr);
            window.alert("File parsing failed. Please ensure the file format is correct.");
          }
        };

        if (file.name.endsWith('.csv')) {
          reader.readAsText(file);
        } else {
          reader.readAsText(file);
        }
      } catch (err) {
        console.error("Import failed:", err);
        window.alert("Import failed. Please ensure the CSV/Excel file is valid.");
      }
    };
    input.click();
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
            Welcome, <span className="name">{firstName}</span>
          </h3>

          {/* Dashboard Stats */}
          <div className="data row my-4">
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">{stats.departmentStudents}</h5>
                <p className="text-start">Department Students</p>
              </div>
            </div>
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">{stats.activeGroups}</h5>
                <p className="text-start">Total Groups</p>
              </div>
            </div>
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">{stats.groupedStudents}</h5>
                <p className="text-start">Grouped Students</p>
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
            <button className="btn btn2 d-flex align-items-center gap-2" onClick={handleImportData}>
              <Upload size={18} />
              Import Data
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

                        <div className="d-flex justify-content-end">
                          <button
                            className="btn btn-sm btn-light text-danger border-0 d-flex align-items-center justify-content-center"
                            style={{
                              borderRadius: "50%",
                              width: "34px",
                              height: "34px",
                            }}
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowDeleteTaskModal(true);
                            }}
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

        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onTaskAdded={fetchTasks}
        />
      </div>

      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onTaskUpdated={fetchTasks}
      />

      {/* Delete Task Confirmation Modal */}
      {showDeleteTaskModal && taskToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h4>Delete Task</h4>
            </div>
            
            <div className="delete-modal-body">
              <p className="delete-warning">
                Are you sure you want to delete this task?
              </p>
              <div className="delete-note">
                <i className="fas fa-info-circle me-2"></i>
                This action cannot be undone. The task will be permanently deleted.
              </div>
            </div>
            
            <div className="delete-modal-footer">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setShowDeleteTaskModal(false);
                  setTaskToDelete(null);
                }}
                disabled={deletingTask}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDeleteTask(taskToDelete.id)}
                disabled={deletingTask}
              >
                {deletingTask ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash me-2"></i>
                    Delete Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
