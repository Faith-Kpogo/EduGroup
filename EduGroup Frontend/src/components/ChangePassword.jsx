import React, { useState } from "react";
import axios from "axios";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isOpen) return null;

 const handleSave = async () => {
  if (newPassword !== confirmPassword) {
    alert("New passwords do not match");
    return;
  }

  const token = localStorage.getItem("token");
  try {
    await axios.patch(
      "http://localhost:5000/api/users/me/password",
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Password changed successfully! Please log in again.");

    // ✅ Force logout
    localStorage.removeItem("token");
    window.location.href = "/login";
  } catch (err) {
    console.error("Error changing password:", err);
    alert(err.response?.data?.message || "Failed to change password");
  }
};



  return (
    <div className="modal-backdrop">
      <div
        className="modal-content bg-white p-4 rounded shadow-sm"
        style={{ width: "400px", margin: "10% auto" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Change Password</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="mb-3">
          <label htmlFor="currentPassword" className="form-label">
            Current Password
          </label>
          <input
            type="password"
            className="form-control"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn mainbtn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
