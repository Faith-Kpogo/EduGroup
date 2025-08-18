import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import axios from 'axios';
import "../App.css";

function ChooseDepartment() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentCode, setSelectedDepartmentCode] = useState('');
  const navigate = useNavigate();

  // ✅ Fetch departments on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/departments')
      .then(response => {
        setDepartments(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch departments:', error);
        alert('Could not load departments');
      });
  }, []);

  const handleContinue = async () => {
  if (!selectedDepartmentCode) {
    alert('Please select a department');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('You are not logged in');
    return;
  }

  try {
    const response = await axios.post(
      'http://localhost:5000/api/department/select',
      { department_code: selectedDepartmentCode },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data.message);
    navigate('/dashboard');
  } catch (error) {
    console.error('Error selecting department:', error);
    alert('Failed to select department');
  }
};


  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <Logo />
        <h4 className="mb-3 text-center">Select Department</h4>
        <select
          className="form-select mb-3"
          value={selectedDepartmentCode}
          onChange={(e) => setSelectedDepartmentCode(e.target.value)}
        >
          <option value="">Choose Department</option>
          {departments.map((dept) => (
            <option key={dept.code} value={dept.code}>
              {dept.name}
            </option>
          ))}
        </select>
        <button className="btn mainbtn w-100" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default ChooseDepartment;
