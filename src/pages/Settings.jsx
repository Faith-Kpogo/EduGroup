import React, { useState } from 'react';
import '../Styles/Settings.css'; // Optional for extra styling
import Sidebar from '../components/Sidebar';
import ChangePasswordModal from '../components/ChangePassword';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="d-flex gap-3">
        <Sidebar />
    <div className="flex-grow-1 p-4">
      <h2 className="fw-bold mb-3">
        Settings
      </h2>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </li>
      </ul>

      {/* Content */}
      {activeTab === 'account' && (
        <div className="bg-white p-4 rounded shadow-sm mb-4">
          <h5 className="mb-3">General</h5>
          <div className="py-3">
            <label className="fw-semibold pb-3">Email address</label>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
              <span>youremail@gmail.com</span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3 pt-3">
            <label className="fw-semibold py-3">Password</label>
              <button className="btn btn-link p-0" onClick={() => setShowPasswordModal(true)}>Change</button>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="bg-white p-4 rounded shadow-sm">
          <h5 className="fw-bold mb-3">Advanced</h5>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-danger">Delete account</span>
            <button className="btn btn-outline-danger btn-sm">Delete</button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white p-4 rounded shadow-sm mb-4">
        <h5 className="mb-3">General</h5>
        <div className="mb-3 d-flex justify-content-between align-items-center border-bottom pb-2">
          <label className="fw-semibold py-3">Name</label>
            <span>your name</span>
        </div>

        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <label className="fw-semibold py-3">Department</label>
            <button className="btn btn-link p-0">Change</button>
        </div>
      </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white p-4 rounded shadow-sm d-flex flex-column gap-3">
        <div>
          <input type="checkbox" className="form-check-input" id="genderBalance" />
          <label className="form-check-label" htmlFor="genderBalance">Enable gender balance by default</label>
        </div>
        <div>
          <input type="checkbox" className="form-check-input" id="academicBalance" />
          <label className="form-check-label" htmlFor="academicBalance">Enable academic balance by default</label>
        </div>
        </div>
      )}
    </div>

    <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>

    
  );
  
};

export default Settings;
