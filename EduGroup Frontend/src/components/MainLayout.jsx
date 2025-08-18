// filepath: src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Logo from '../components/Logo';
import { Menu } from 'lucide-react';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="d-flex">
      {/* Responsive Header for small screens */}
      {windowWidth <= 900 && (
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2 bg-white shadow-sm w-100 position-fixed top-0 start-0"
          style={{ zIndex: 1400 }}
        >
          <Logo height={40} />
          <button
            className="border-none btn-light border-0 d-flex align-items-center justify-content-center p-2 rounded"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Sidebar"
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className="d-none d-md-block"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "240px",
          zIndex: 1200,
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 p-4 main-content"
        style={
          windowWidth > 900
            ? { marginLeft: "240px" } // shift for fixed sidebar
            : { marginTop: "50px" }   // shift for mobile header
        }
      >
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
