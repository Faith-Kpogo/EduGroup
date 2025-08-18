import React from "react";

function Logo(){
    return(
        <div className="d-flex align-items-center mb-3">
          <img src="/logo.png" alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
          <h5 className="mb-0">EDUGROUP</h5>
        </div>
    )
}

export default Logo;