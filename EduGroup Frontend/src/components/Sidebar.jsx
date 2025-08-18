import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../Styles/Sidebar.css';
import { LogOut, LayoutDashboard, Users, History, Settings, X } from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ isOpen, onClose }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const popupRef = useRef(null);

  const togglePopup = () => setShowPopup(!showPopup);

  const handleLogout = () => {
    console.log('Logging out...');
  };
  const userName = localStorage.getItem('userName');
  const firstName = userName ? userName.split(' ')[0] : '';
  const firstInitial = firstName ? firstName[0].toUpperCase() : '';

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sidebar content (shared)
  const sidebarLinks = (
    <ul className="list-unstyled sidebar-links">
      <li className="mb-2">
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}>
          <LayoutDashboard size={18} className="me-2" /> Dashboard
        </NavLink>
      </li>
      <li className="mb-2">
        <NavLink to="/creategroups" className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}>
          <Users size={18} className="me-2" /> Create Groups
        </NavLink>
      </li>
      <li className="mb-2">
        <NavLink to="/groupshistory" className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}>
          <History size={18} className="me-2" /> Groups History
        </NavLink>
      </li>
      <li className="mb-2">
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}>
          <Settings size={18} className="me-2" /> Settings
        </NavLink>
      </li>
    </ul>
  );

  const profileSection = (
    <div className="sidebar-profile position-relative" ref={popupRef}>
      <div
        className="d-flex align-items-center p-2 rounded cursor-pointer"
        style={{ cursor: 'pointer' }}
        onClick={togglePopup}
      >
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#2C3690',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '1.1rem',
          marginRight: 10
        }}>{firstInitial}</div>
        <span className="fw-medium">{firstName}</span>
      </div>
      {showPopup && (
        <div className="position-absolute bg-white border rounded shadow-sm p-2" style={{ bottom: '60px', left: 0, zIndex: 1000 }}>
          <Link className="text-decoration-none" to="/">
            <button
              className="btn btn-light d-flex align-items-center gap-2 w-100"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log out
            </button>
          </Link>
        </div>
      )}
    </div>
  );

  // Desktop Sidebar (left, no close button, absolute profile)
  if (windowWidth > 900) {
    return (
      <div className="sidebar" style={{ position: 'relative', minHeight: '100vh' }}>
        <div className="sidebar-header d-flex align-items-center justify-content-between">
          <Logo height={40} />
        </div>
        <div className="sidebar-content">
          {sidebarLinks}
        </div>
        <div className="sidebar-profile-absolute">
          {profileSection}
        </div>
      </div>
    );
  }

  // Mobile Sidebar (right, with close button, flex profile)
  return (
    <div className={`sidebar-right${isOpen ? ' open' : ''}`} style={{ zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="sidebar-header d-flex align-items-center justify-content-between">
        <Logo height={40} />
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <X size={24} />
        </button>
      </div>
      <div className="sidebar-content">
        {sidebarLinks}
      </div>
      <div className="sidebar-profile">
        {profileSection}
      </div>
    </div>
  );
};

export default Sidebar;
