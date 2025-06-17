import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import '../Styles/Login.css'

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    // Store the user in localStorage (TEMPORARY)
    const user = {
      name: form.name,
      email: form.email,
      password: form.password, // NOTE: Don't do this in production!
    };
  

    

    localStorage.setItem('tempUser', JSON.stringify(user));
    navigate('/department');
  };
  

  return (
    <div className="login-container container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <Logo />
        <h3 className="text-center mb-3">Create Account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.name}</div>
          </div>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.password}</div>
          </div>

          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.confirmPassword}</div>
          </div>

          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <Link className='sign' to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
