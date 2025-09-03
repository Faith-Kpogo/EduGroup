// src/pages/CheckEmail.jsx
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Logo from "../components/Logo";
import "../Styles/Login.css";

function CheckEmail() {
  const location = useLocation();
  const [email, setEmail] = useState("your email");

  // ✅ Prefill email if passed from login/signup
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleResend = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Verification email resent! Please check your inbox.");
      } else {
        alert(data.message || "Failed to resend verification email.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      alert("Something went wrong while resending email.");
    }
  };

  return (
    <div className="login-container container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="card p-4 shadow text-center" style={{ width: "100%", maxWidth: "400px" }}>
        <Logo />
        <h3 className="mb-3">Check Your Email</h3>
        <p>
          We’ve sent a verification link to <strong>{email}</strong>. <br />
          Please check your inbox (and spam folder) to continue.
        </p>

        <button className="btn mainbtn w-100 mt-3" onClick={handleResend}>
          Resend Verification Email
        </button>

        <p className="mt-3">
          <Link className="sign" to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default CheckEmail;
