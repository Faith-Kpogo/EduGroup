import React, { useState } from 'react';
import axios from 'axios';

const AddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Inline error state

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title || !dueDate) {
      setError("Title and Due Date are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      await axios.post(
        "https://edugroup.onrender.comapi/tasks",
        { title, description, due_date: dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Refresh tasks in Dashboard
      if (onTaskAdded) {
        onTaskAdded();
      }

      // ✅ Close modal and reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      setError("Failed to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content bg-white p-4 rounded shadow-sm"
        style={{ width: "500px", margin: "10% auto" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Add Task</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="taskTitle" className="form-label">Task Title</label>
          <input
            type="text"
            className="form-control"
            id="taskTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="taskDescription" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="taskDescription"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="dueDate" className="form-label">Due Date</label>
          <input
            type="date"
            className="form-control"
            id="dueDate"
            value={dueDate}
            min={new Date().toISOString().split("T")[0]} // ✅ disable past dates
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn mainbtn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
