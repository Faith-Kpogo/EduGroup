import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

function VerifySuccess() {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow text-center" style={{ maxWidth: "400px", width: "100%" }}>
        <Logo />
        <h3 className="mb-3">Email Verified 🎉</h3>
        <p>Your email has been successfully verified. You can now log in.</p>
        <button
          className="btn mainbtn w-100 mt-3"
          onClick={() => navigate("/")}
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
}

export default VerifySuccess;
