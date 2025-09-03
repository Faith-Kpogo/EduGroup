import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import axios from 'axios';
import "../App.css";
import { useToast } from '../components/Toast';

function ChooseDepartment() {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentCode, setSelectedDepartmentCode] = useState('');
  const navigate = useNavigate();

  // ✅ Fetch departments on mount
  useEffect(() => {
    axios.get('https://edugroup.onrender.com/api/departments')
      .then(response => {
        setDepartments(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch departments:', error);
        toast.error('Could not load departments');
      });
  }, []);

const handleContinue = async () => {
  if (!selectedDepartmentCode) {
    toast.warning('Please select a department');
    return;
  }

  const token = localStorage.getItem('token');
  console.log("🔑 Token from localStorage:", token);

  if (!token) {
    toast.error('You are not logged in');
    navigate("/"); // back to login
    return;
  }

  try {
    const response = await axios.post(
      'https://edugroup.onrender.com/api/department/select',
      { department_code: selectedDepartmentCode },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Department selection response:", response.data);
    
    // Store department information in localStorage
    let departmentName = "";
    
    if (response.data.department_name) {
      departmentName = response.data.department_name;
      localStorage.setItem('userDepartment', departmentName);
      console.log("✅ Department stored in localStorage:", departmentName);
    } else if (response.data.department) {
      departmentName = response.data.department;
      localStorage.setItem('userDepartment', departmentName);
      console.log("✅ Department stored in localStorage:", departmentName);
    } else {
      console.log("❌ No department information in response");
      console.log("Full response data:", response.data);
    }
    
    // Also store the department code for future reference
    if (selectedDepartmentCode) {
      localStorage.setItem('userDepartmentCode', selectedDepartmentCode);
      console.log("✅ Department code stored:", selectedDepartmentCode);
    }
    
    toast.success("Department selected successfully!");
    navigate('/dashboard');
  } catch (error) {
    console.error('❌ Error selecting department:', error.response || error);
    toast.error(error.response?.data?.message || 'Failed to select department');
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
