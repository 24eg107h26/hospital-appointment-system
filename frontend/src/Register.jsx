import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Api from "./Api.jsx";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "Male",
    address: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nameTrimmed = formData.name.trim();
    const emailTrimmed = formData.email.trim();
    const phoneTrimmed = formData.phone.trim();

    if (!nameTrimmed || !emailTrimmed || !formData.password || !phoneTrimmed) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const parsedAge = formData.age ? parseInt(formData.age, 10) : null;
    if (parsedAge !== null && (isNaN(parsedAge) || parsedAge <= 0)) {
      setError("Age must be greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: nameTrimmed,
        email: emailTrimmed.toLowerCase(),
        password: formData.password,
        phone: phoneTrimmed,
        age: parsedAge,
        gender: formData.gender,
        address: formData.address ? formData.address.trim() : ""
      };

      await Api.post("/api/auth/register", payload);
      setSuccess("Registration successful! You can now log in with your credentials.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      let msg = "Registration failed. Please try again.";
      if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
        msg = "Backend server is offline or unreachable (502 Bad Gateway). Please make sure the Spring Boot backend is running on port 8080.";
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
            <p style={{ color: "#E3F2FD", fontSize: "13px" }}>Digital Patient Portal</p>
          </div>
        </div>

        <div className="auth-hero-content">
          <h2>Create Your Patient Profile</h2>
          <p className="auth-tagline">Join thousands of patients who save time with digital token booking.</p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-bullet">1</div>
              <div>Book specialist appointments with zero in-person waiting</div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-bullet">2</div>
              <div>Get an automatic digital token number and live status updates</div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-bullet">3</div>
              <div>View your complete consultation history in one secure place</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
          &copy; {new Date().getFullYear()} ApexCare Hospital. All rights reserved.
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card" style={{ maxWidth: "520px" }}>
          <div className="auth-card-header">
            <h2>Patient Registration</h2>
            <p>Please enter your personal details to generate your patient profile.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name *
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password *
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone Number *
                </label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-age">
                  Age
                </label>
                <input
                  id="reg-age"
                  name="age"
                  type="number"
                  className="form-input"
                  placeholder="28"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-gender">
                  Gender
                </label>
                <select
                  id="reg-gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-address">
                Residential Address
              </label>
              <textarea
                id="reg-address"
                name="address"
                className="form-textarea"
                rows="2"
                placeholder="Street address, city, state"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ padding: "12px", fontSize: "15px", marginTop: "10px" }}
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Patient Account"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "var(--secondary-text)" }}>
            Already registered?{" "}
            <Link to="/login" style={{ fontWeight: 600, color: "var(--primary-blue)" }}>
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
