// Loader.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";


export default function Loader() {
  return (<>
  
<div className="loader-overlay d-flex justify-content-center align-items-center">
      <div className="d-flex align-items-center gap-2">
        <div className="dot bg-primary"></div>
        <div className="dot bg-success"></div>
        <div className="dot bg-warning"></div>
      </div>
    </div>  

</>

  );
}
