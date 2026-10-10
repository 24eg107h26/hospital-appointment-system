import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: "24px",
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          marginBottom: "20px"
        }}
      >
        🏥
      </div>
      <h1 style={{ fontSize: "56px", fontWeight: 800, color: "#1E293B", margin: 0, lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#334155", marginTop: "12px", marginBottom: "8px" }}>
        Page Not Found
      </h2>
      <p style={{ color: "#64748B", fontSize: "15px", maxWidth: "420px", marginBottom: "28px" }}>
        The page you are looking for does not exist or has been moved within the hospital portal.
      </p>
      <Link
        to="/dashboard"
        className="btn btn-primary"
        style={{
          padding: "12px 28px",
          fontSize: "15px",
          borderRadius: "8px",
          textDecoration: "none"
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
