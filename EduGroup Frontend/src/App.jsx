import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Register';
import Department from './pages/Department';
import Dashboard from './pages/Dashboard';
import CreateGroups from './pages/CreateGroups';
import '../src/App.css'
import GroupsHistory from './pages/GroupsHistory';
import Settings from './pages/Settings';
import GroupDetails from './pages/GroupDetails';
import PreviewGroups from './pages/PreviewGroups';
import Admin from './pages/Admin';
import CheckEmail from "./pages/CheckEmail";
import VerifySuccess from "./pages/VerifySuccess";
import VerifyFailed from "./pages/VerifyFailed";

function App() {
   useEffect(() => {
    fetch('https://edugroup.onrender.com')  // backend URL
      .then(res => res.text())
      .then(data => {
        console.log('Response from backend:', data);
      })
      .catch(err => {
        console.error('Error connecting to backend:', err);
      });
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/department" element={<Department />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/creategroups" element={<CreateGroups />} />
        <Route path="/groupshistory" element={<GroupsHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/previewgroups/:batchId" element={<PreviewGroups />} />
        <Route path="/groupdetails/:groupId" element={<GroupDetails />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify-success" element={<VerifySuccess />} />
        <Route path="/verify-failed" element={<VerifyFailed />} />

      </Routes>
    </Router>
  );
}

export default App;
