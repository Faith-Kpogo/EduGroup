import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../Styles/Sidebar.css';
import { LogOut, LayoutDashboard, Users, History, Settings, X, BarChart3 } from 'lucide-react';
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
  const lastName = userName ? userName.split(' ').slice(1).join(' ') : '';
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
        <NavLink 
          to="/dashboard" 
          end 
          className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}
          onClick={() => windowWidth <= 900 && onClose()}
        >
          <LayoutDashboard size={18} className="me-2" /> Dashboard
        </NavLink>
      </li>
      <li className="mb-2">
        <NavLink 
          to="/creategroups" 
          className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}
          onClick={() => windowWidth <= 900 && onClose()}
        >
          <Users size={18} className="me-2" /> Create Groups
        </NavLink>
      </li>
      <li className="mb-2">
        <NavLink 
          to="/groupshistory" 
          className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}
          onClick={() => windowWidth <= 900 && onClose()}
        >
          <History size={18} className="me-2" /> Groups History
        </NavLink>
      </li>
      <li className="mb-2">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}
          onClick={() => windowWidth <= 900 && onClose()}
        >
          <Settings size={18} className="me-2" /> Settings
        </NavLink>
      </li>
      {/* Admin link - only show for admin users */}
      {localStorage.getItem('isAdmin') === 'true' && (
        <li className="mb-2">
          <NavLink 
            to="/admin" 
            className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}
            onClick={() => windowWidth <= 900 && onClose()}
          >
            <BarChart3 size={18} className="me-2" /> Admin
          </NavLink>
        </li>
      )}
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
        <span className="fw-medium">{firstName} {lastName}</span>
      </div>
      {showPopup && (
        <div className="position-absolute bg-white border rounded shadow-lg p-3" style={{ 
          bottom: '60px', 
          left: -8, 
          zIndex: 1000,
          minWidth: '200px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
        }}>
          {/* User Email Section */}
          <div className="d-flex align-items-center p-2 mb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#f3f4f6',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {localStorage.getItem('userEmail') || 'user@example.com'}
            </span>
          </div>
          
          {/* Logout Button */}
          <Link className="text-decoration-none" to="/">
            <button
              className="btn d-flex align-items-center gap-2 w-100 text-start"
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px 12px',
                color: '#374151',
                fontSize: '14px',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} style={{ color: '#6b7280' }} />
              Log out
            </button>
          </Link>
        </div>
      )}
    </div>
  );

  // Desktop Sidebar
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

  // Mobile Sidebar
  return (
    <div className="sidebar-right" style={{ 
      width: '250px', 
      height: '100vh', 
      background: '#fff', 
      boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
      display: 'flex', 
      flexDirection: 'column', 
      
      padding: '20px 10px'
    }}>
      <div className="sidebar-header d-flex align-items-center justify-content-between">
        <Logo height={40} />
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close Sidebar"
          style={{
            background: '#2c36902ce',
            border: 'none',
            borderRadius: '50%',
            fontSize: '2rem',
            color: '#2C3690',
            cursor: 'pointer',
            padding: 0,
            height: '40px',
            width: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
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
