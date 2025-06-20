import React, { useState } from 'react';

const AddTaskModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content bg-white p-4 rounded shadow-sm"
        style={{ width: '500px', margin: '10% auto' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Add Task</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="mb-3">
          <label htmlFor="taskTitle" className="form-label">
            Task Title
          </label>
          <input
            type="text"
            className="form-control"
            id="taskTitle"
            placeholder="Enter task title"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="taskDescription" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="taskDescription"
            rows="3"
            placeholder="Enter task description"
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="dueDate" className="form-label">
            Due Date
          </label>
          <input type="date" className="form-control" id="dueDate" />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary">Save Task</button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
