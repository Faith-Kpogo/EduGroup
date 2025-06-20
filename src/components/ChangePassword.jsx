import React from 'react';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content bg-white p-4 rounded shadow-sm" style={{ width: '400px', margin: '10% auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Password</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="mb-3">
          <label htmlFor="currentPassword" className="form-label">Current Password</label>
          <input type="password" className="form-control" id="currentPassword" placeholder="Current Password" />
        </div>

        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input type="password" className="form-control" id="newPassword" placeholder="New Password" />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input type="password" className="form-control" id="confirmPassword" placeholder="Confirm Password" />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
