import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Logo from '../components/Logo';
import '../Styles/Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(''); // NEW

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError(''); // reset error on submit

    if (!validate()) return;

    const storedUser = JSON.parse(localStorage.getItem('tempUser'));

    if (!storedUser) {
      setGeneralError('No account found. Please sign up first.');
      return;
    }

    if (
      email === storedUser.email &&
      password === storedUser.password
    ) {
      localStorage.setItem('userName', storedUser.name);
      navigate('/dashboard');
    } else {
      setGeneralError('Invalid email or password');
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <Logo />
        <h4 className="text-center mb-4">Login</h4>
        <form onSubmit={handleSubmit}>
          {generalError && (
            <div className="alert alert-danger py-2" role="alert">
              {generalError}
            </div>
          )}
          <div className="mb-3">
            <label className="form-label d-flex align-items-center gap-2">
              <Mail size={18} /> Email
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>
          <div className="mb-3">
            <label className="form-label d-flex align-items-center gap-2">
              <Lock size={18} /> Password
            </label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="invalid-feedback">{errors.password}</div>
          </div>
          <div className="mb-3 text-end">
            <a href="#" className="text-decoration-none">Forgot password?</a>
          </div>
          <button type="submit" className="btn mainbtn w-100">Login</button>
          <p className="text-center mt-3">
            Don't have an account? <Link className='sign' to="/Signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
