import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Register';
import Department from './pages/Department';
import Dashboard from './pages/Dashboard';
import CreateGroups from './pages/CreateGroups';
import '../src/App.css'
import GroupsHistory from './pages/GroupsHistory';
import Settings from './pages/Settings';


function App() {
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
      </Routes>
    </Router>
  );
}

export default App;
