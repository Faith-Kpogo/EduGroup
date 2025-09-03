import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Settings.css";
import ChangePasswordModal from "../components/ChangePassword";
import DeleteAccountModal from "../components/DeleteAccountModal"; // ✅ new modal
import MainLayout from "../components/MainLayout";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ User state
  const [user, setUser] = useState({ 
    email: "", 
    name: "", 
    department: localStorage.getItem('userDepartment') || "" 
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("https://edugroup.onrender.com/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          ...res.data,
          department: res.data.department || localStorage.getItem('userDepartment') || ""
        });
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <MainLayout>
      <div className="d-flex gap-3">
        <div className="flex-grow-1 p-4">
          <h2 className="fw-bold mb-3">Settings</h2>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "account" ? "active" : ""}`}
                onClick={() => setActiveTab("account")}
              >
                Account
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
            </li>
          </ul>

          {/* Account */}
          {activeTab === "account" && (
            <>
              <div className="bg-white p-4 rounded shadow-sm mb-4">
                <h5 className="mb-3">General</h5>
                <div className="py-3">
                  <label className="fw-semibold pb-3">Email address</label>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3 pt-3">
                  <label className="fw-semibold py-3">Password</label>
                  <button
                    className="btn btn-link p-0"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow-sm">
                <h5 className="fw-bold mb-3">Advanced</h5>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-danger">Delete account</span>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setShowDeleteModal(true)} // ✅ opens modal
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="bg-white p-4 rounded shadow-sm mb-4">
              <h5 className="mb-3">General</h5>
              <div className="mb-3 d-flex justify-content-between align-items-center border-bottom pb-2">
                <label className="fw-semibold py-3">Name</label>
                <span>{user.name}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <label className="fw-semibold py-3">Department</label>
                <span>{user.department}</span>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Modals */}
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          userEmail={user.email}
        />
      </div>
    </MainLayout>
  );
};

export default Settings;
