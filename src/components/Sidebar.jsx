import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../Styles/Sidebar.css';
import { User, LogOut } from 'lucide-react';
import Logo from './Logo';


const Sidebar = () => {

  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

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
    <div className="sidebar p-3 vh-100 d-flex flex-column justify-content-between">
      <div>
      <Logo />
      <ul className="list-unstyled sidebar-links">
      <li className="mb-2">
          <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}>
            Dashboard
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/creategroups" className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}>
            Create Groups
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/groupshistory" className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}>
            Groups History
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'active-link' : 'text-decoration-none'}>
            Settings
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
          <User size={20} className="me-2" />
          <span className="fw-medium">John Doe</span>
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
