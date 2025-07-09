import React, { useState } from 'react';
import Logo from '../components/Logo';
import "../Styles/Dashboard.css"
import Sidebar from '../components/Sidebar';
import { Plus, Upload, Download, ListTodo, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import AddTaskModal from '../components/AddTask';
import MainLayout from '../components/MainLayout';



const Dashboard = () => {

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const userName = localStorage.getItem('userName');


  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setSidebarOpen(window.innerWidth > 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <MainLayout>
      <div className="d-flex flex-column flex-md-row">
        
       
        <div className="flex-grow-1 p-4 main-content">
          <h3>Welcome, <span className="name">{userName}</span></h3>

          <div className="data row my-4">
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">0</h5>
                <p className="text-start">Total Students</p>
              </div>
            </div>
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">0</h5>
                <p className="text-start">Active Groups</p>
              </div>
            </div>
            <div className="col-4">
              <div className="bg-light p-3 rounded shadow-sm">
                <h5 className="text-start fw-bold">0</h5>
                <p className="text-start">Recent Activity</p>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mb-4">
            <Link className="text-decoration-none" to="/creategroups"><button className="btn mainbtn d-flex align-items-center gap-2 "><Plus size={18} />Create New Group</button></Link>
            <button className="btn btn2 d-flex align-items-center gap-2"><Upload size={18} />Import Data</button>
            <button className="btn btn2 d-flex align-items-center gap-2"><Download size={18} />Export Data</button>
            <button className="btn mainbtn d-flex align-items-center gap-2" onClick={() => setShowAddTaskModal(true)}><ListTodo size={18} />Add Task</button>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h5>Recent Groups</h5>
            <div className="table-responsive-custom">
              <Table />                  
            </div>
          </div>

          

          <div className="mt-3 bg-light p-3 rounded">
            <strong>Upcoming tasks</strong>
            <p className="mb-0">No pending tasks</p>
          </div>
        </div>
        <AddTaskModal isOpen={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} />

      </div>
    </MainLayout>
  );
};

export default Dashboard;
