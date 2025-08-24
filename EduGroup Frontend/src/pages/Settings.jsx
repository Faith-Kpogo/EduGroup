import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Settings.css";
import ChangePasswordModal from "../components/ChangePassword";
import MainLayout from "../components/MainLayout";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ✅ User state
  const [user, setUser] = useState({ email: "", name: "", department: "" });
  const [preferences, setPreferences] = useState({
    genderBalance: false,
    academicBalance: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setPreferences({
          genderBalance: res.data.genderBalance || false,
          academicBalance: res.data.academicBalance || false,
        });
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUser();
  }, []);

  // ✅ Save preferences
  const handleSavePreferences = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        "http://localhost:5000/api/users/preferences",
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Preferences updated successfully!");
    } catch (err) {
      console.error("Error updating preferences:", err);
      alert("Failed to update preferences");
    }
  };

  // ✅ Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Account deleted successfully!");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account");
    }
  };

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
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "preferences" ? "active" : ""
                }`}
                onClick={() => setActiveTab("preferences")}
              >
                Preferences
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
                    onClick={handleDeleteAccount}
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

          {/* Preferences */}
          {activeTab === "preferences" && (
            <div className="bg-white p-4 rounded shadow-sm d-flex flex-column gap-3">
              <div>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="genderBalance"
                  checked={preferences.genderBalance}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      genderBalance: e.target.checked,
                    })
                  }
                />
                <label
                  className="form-check-label ms-2"
                  htmlFor="genderBalance"
                >
                  Enable gender balance by default
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="academicBalance"
                  checked={preferences.academicBalance}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      academicBalance: e.target.checked,
                    })
                  }
                />
                <label
                  className="form-check-label ms-2"
                  htmlFor="academicBalance"
                >
                  Enable academic balance by default
                </label>
              </div>
              <button
                className="btn btn-primary mt-3"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>

        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      </div>
    </MainLayout>
  );
};

export default Settings;
