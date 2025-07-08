import React from 'react';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import {Download, ChevronLeft ,ChevronRight } from 'lucide-react';
import '../Styles/GroupsHistory.css'
import Table from '../components/Table';

const GroupsHistory = () => {
  // Simulate an empty group list
  const groups = [];

  return (
    <MainLayout>
    <div className="d-flex">
    <div className="p-4">
      <h3 className="mb-1">Groups History</h3>
      <p className="text-muted mb-4">View previously generated student groups</p>

      <div className="mainsection bg-white p-4 rounded shadow-sm">
        <div className="d-flex gap-3 mb-3">
          <input type="text" className="form-control" placeholder="Search groups" style={{ maxWidth: '200px' }} />
          <select className="form-select" style={{ maxWidth: '150px' }}>
            <option>Last 30 days</option>
          </select>
          <select className="form-select" style={{ maxWidth: '180px' }}>
            <option>All courses/classes</option>
          </select>
          <select className="form-select" style={{ maxWidth: '150px' }}>
            <option>All Statuses</option>
          </select>
          <button className="btn mainbtn ms-auto d-flex align-items-center gap-2">
            <Download size={18} />Export
          </button>
        </div>

        <Table groups={groups} />

        <div className="d-flex pt-5 justify-content-end align-items-center">
            <nav>
                <ul className="pagination mb-0">
                <li className="page-item disabled"><span className="page-link"><ChevronLeft size={18} />Previous</span></li>
                <li className="page-item active"><span className="page-link">1</span></li>
                <li className="page-item disabled"><span className="page-link">Next<ChevronRight size={18}/></span></li>
                </ul>
            </nav>
        </div>

       
      </div>
      <div className="main2 bg-white p-4 mt-4 rounded shadow-sm text-center">
            <h5 className="mb-4 text-start">Groups Analytics</h5>
            <div className="row">
            <div className="col">
                <h4>0</h4>
                <p>Total Groups</p>
            </div>
            <div className="col">
                <h4>0</h4>
                <p>Active Groups</p>
            </div>
            <div className="col">
                <h4>0</h4>
                <p>Students Assigned</p>
            </div>
            </div>
        </div>
    </div>
    </div>
    </MainLayout>
  );
};

export default GroupsHistory;
