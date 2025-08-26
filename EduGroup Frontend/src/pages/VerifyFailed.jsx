import React from "react";

function VerifyFailed() {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card p-4 shadow text-center" style={{ maxWidth: "400px" }}>
        <h3>Email Verification Failed ❌</h3>
        <p className="text-danger">The verification link is invalid or has expired.</p>
      </div>
    </div>
  );
}

export default VerifyFailed;
