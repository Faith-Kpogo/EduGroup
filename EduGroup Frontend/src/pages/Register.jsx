import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import Logo from '../components/Logo';
import '../Styles/Login.css'

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agree) {
      newErrors.agree = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  const signupData = {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Account created successfully!');

      // ✅ Save JWT token for future requests
      localStorage.setItem('token', data.token);

      // ✅ Also store user info if needed
      const user = {
        name: `${firstName} ${lastName}`.trim(),
        email,
      };
      localStorage.setItem('userName', user.name);

      navigate('/department');
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    console.error('Signup error:', err);
    alert('Something went wrong while signing up');
  }
};



  return (
    <div className="login-container container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <Logo />
        <h3 className="text-center mb-3">Create Account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <div className="row g-2 align-items-center">
              <div className="col-6">
                <label className="form-label d-flex align-items-center gap-2">
                  <User size={18} /> First Name
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <div className="invalid-feedback">{errors.firstName}</div>
              </div>
              <div className="col-6">
                <label className="form-label d-flex align-items-center gap-2">
                  <User size={18} /> Last Name
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <div className="invalid-feedback">{errors.lastName}</div>
              </div>
            </div>
          </div>

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

          <div className="mb-3">
            <label className="form-label d-flex align-items-center gap-2">
              <Lock size={18} /> Confirm Password
            </label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="invalid-feedback">{errors.confirmPassword}</div>
          </div>
          <div className="mb-3">
            <div className={`form-check d-flex align-items-start ${errors.agree ? 'is-invalid' : ''}`} style={{marginLeft: 0, paddingLeft: 0}}>
              <input
                type="checkbox"
                className="mt-1"
                id="agreeCheck"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#4f46e5', marginLeft: 0 }}
              />
              <label className="form-check-label ms-2" htmlFor="agreeCheck" style={{marginLeft: '0.5rem'}}>
                I have read and agree to the <a href="#" className="text-decoration-underline">Terms and Conditions</a> and <a href="#" className="text-decoration-underline">Privacy Policy</a>.
              </label>
            </div>
            {errors.agree && (
              <div className="text-danger small mt-1">{errors.agree}</div>
            )}
          </div>


          <button type="submit" className="btn mainbtn w-100">Sign Up</button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <Link className='sign' to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
