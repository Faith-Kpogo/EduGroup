import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../Styles/Sidebar.css';
import { LogOut, LayoutDashboard, Users, History, Settings, X } from 'lucide-react';
import Logo from './Logo';


const Sidebar = ({ isOpen, onClose }) => {

  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };
  const userName = localStorage.getItem('userName');
  const firstName = userName ? userName.split(' ')[0] : '';
  const firstInitial = firstName ? firstName[0].toUpperCase() : '';

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


  return (
    <div className={`sidebar p-3 vh-100 d-flex flex-column justify-content-between${isOpen ? ' open' : ''}`}
      style={isOpen === false ? { display: 'none' } : {}}>
      {typeof onClose === 'function' && (
        <button className="close-btn d-md-none" onClick={onClose} aria-label="Close Sidebar"> <X /></button>
      )}
      <div>
      <Logo />
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
      </div>

      <div className="position-relative" ref={popupRef}>
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
          <div className="position-absolute bg-white border rounded shadow-sm p-2" style={{ bottom: '45px', left: 0, zIndex: 1000 }}>
            <Link className="text-decoration-none" to="/">
            <button
              className="btn btn-light d-flex align-items-center gap-2 w-100"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log out
            </button></Link>
          </div>
        )}
      </div>
      </div>
  );
};

export default Sidebar;
