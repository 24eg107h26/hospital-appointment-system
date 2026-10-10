import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Api from "./Api.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await Api.post("/api/auth/login", { 
        email: trimmedEmail.toLowerCase(), 
        password 
      });
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      localStorage.setItem("userId", data.userId || "");
      if (data.doctorId) localStorage.setItem("doctorId", data.doctorId);
      if (data.patientId) localStorage.setItem("patientId", data.patientId);

      navigate("/dashboard");
    } catch (err) {
      let msg = "Invalid credentials. Please try again.";
      if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
        msg = "Backend server is offline or unreachable (502 Bad Gateway). Please make sure the Spring Boot backend is running on port 8080.";
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        msg = "Invalid email or password. Please try again.";
      } else if (err.response?.data) {
        if (typeof err.response.data === "string") {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.error) {
          msg = err.response.data.error;
        } else if (err.response.data.errors && typeof err.response.data.errors === "object") {
          const firstErr = Object.values(err.response.data.errors)[0];
          if (firstErr) msg = firstErr;
        }
      } else if (err.message) {
        msg = err.message === "Network Error"
          ? "Unable to connect to the server. Please verify backend connection."
          : err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Brand Side */}
      <div className="auth-brand-side">
        <div className="auth-brand-header">
          <div className="auth-brand-logo">➕</div>
          <div>
            <h1>ApexCare Hospital</h1>
            <p style={{ color: "#E3F2FD", fontSize: "13px" }}>Healthcare Management Portal</p>
          </div>
        </div>

        <div className="auth-hero-content">
          <h2>Hospital Appointment &amp; Token System</h2>
          <p className="auth-tagline">Book appointments. Track your token. Save time.</p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-bullet">✓</div>
              <div>Instant token generation &amp; real-time queue position</div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-bullet">✓</div>
              <div>Certified specialists with live weekly consultation schedules</div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-bullet">✓</div>
              <div>Live queue updates — no waiting in crowded hospital halls</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
          &copy; {new Date().getFullYear()} ApexCare Hospital. All rights reserved.
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your hospital account and queue status.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="form-label" htmlFor="password-input" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{ background: "none", border: "none", color: "#1976D2", fontSize: "12px", cursor: "pointer" }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ padding: "12px", fontSize: "15px", marginTop: "12px" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login to Portal"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--secondary-text)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: 600, color: "var(--primary-blue)" }}>
              Register as Patient
            </Link>
          </div>

          {/* Quick Demo Credentials Box for convenience */}
          <div style={{ marginTop: "24px", padding: "12px", backgroundColor: "#F5F7FA", borderRadius: "8px", fontSize: "11px", color: "#607D8B", border: "1px solid #ECEFF1" }}>
            <div style={{ fontWeight: 700, marginBottom: "4px", color: "#263238" }}>Default Hospital Access:</div>
            <div>Admin: <strong>admin@gmail.com</strong> / <strong>admin123</strong></div>
            <div>Doctor: <strong>alice@hospital.com</strong> / <strong>doctor123</strong></div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Password Recovery</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowForgotModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "14px", color: "var(--text)", marginBottom: "12px" }}>
                For security reasons, hospital user credentials are encrypted. If you are a patient or doctor and need your password reset:
              </p>
              <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--secondary-text)", lineHeight: "1.6" }}>
                <li>Please visit the ApexCare reception desk or contact the hospital IT desk at <strong>support@apexcare.org</strong>.</li>
                <li>Admins can reset or create new credentials directly via the hospital database or administrative terminal.</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowForgotModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
