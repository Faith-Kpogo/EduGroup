import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import '../Styles/Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Redirect to verify page if backend signals it
        if (data.requiresVerification) {
          navigate('/check-email', { state: { email } });
          return;
        }

        setGeneralError(data.message || 'Login failed');
        return;
      }

      // ✅ Save token + user info
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log("✅ Token saved to localStorage:", data.token);
      }

      localStorage.setItem('userEmail', data.email || email);
      if (data.first_name && data.last_name) {
        localStorage.setItem('userName', `${data.first_name} ${data.last_name}`);
      }

      if (data.department_name) {
        localStorage.setItem('userDepartment', data.department_name);
      }

      localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false');

      // ✅ Redirects
      if (data.isAdmin) {
        navigate('/admin');
      } else if (data.departmentSelected) {
        navigate('/dashboard');
      } else {
        navigate('/department');
      }
    } catch (err) {
      console.error('Login error:', err);
      setGeneralError('An error occurred. Please try again.');
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

          <div className="mb-3 position-relative">
            <label className="form-label d-flex align-items-center gap-2">
              <Lock size={18} /> Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-control pe-5 ${errors.password ? 'is-invalid' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
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
