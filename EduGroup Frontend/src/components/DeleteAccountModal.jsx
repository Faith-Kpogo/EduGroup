import React, { useState } from "react";
import axios from "axios";

const DeleteAccountModal = ({ isOpen, onClose, userEmail }) => {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async (e) => {
    e.preventDefault();

    if (emailInput !== userEmail) {
      alert("Email does not match your account");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      await axios.delete("https://edugroup.onrender.com/api/users/me", {
  headers: { Authorization: `Bearer ${token}` },
  data: { email: emailInput }  // ✅ send email
});
      alert("Account deleted successfully!");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting account:", err);
      alert(err.response?.data?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content bg-white p-4 rounded shadow-sm"
        style={{ width: "400px", margin: "10% auto" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 text-danger">Delete Account</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <p className="text-muted mb-3">
          Please type <strong>{userEmail}</strong> to confirm account deletion.  
          This action <span className="text-danger">cannot be undone</span>.
        </p>

        <form onSubmit={handleDelete}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
          </div>

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
              type="submit"
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
