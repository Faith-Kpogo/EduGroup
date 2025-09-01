import React from "react";

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete", 
  message = "Are you sure you want to delete this item?", 
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content bg-white p-4 rounded shadow-sm"
        style={{ width: "400px", margin: "10% auto" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 text-danger">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <p className="text-muted mb-3">{message}</p>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
