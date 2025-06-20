import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import "../App.css"

function ChooseDepartment() {
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!department) {
      alert('Please select a department');
      return;
    }

    // Optionally save to localStorage
    const user = JSON.parse(localStorage.getItem('tempUser'));
    user.department = department;
    localStorage.setItem('tempUser', JSON.stringify(user));

    navigate('/dashboard');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
      <Logo />
        <h4 className="mb-3 text-center">Select Department</h4>
        <select
          className="form-select mb-3"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">Choose Department</option>
          <option value="IT">Information Technology</option>
          <option value="CS">Computer Science</option>
        </select>
        <button className="btn mainbtn w-100" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default ChooseDepartment;
