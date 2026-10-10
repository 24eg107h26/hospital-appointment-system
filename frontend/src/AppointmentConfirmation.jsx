import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Layout from "./Layout.jsx";

const AppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const details = location.state || {};

  const tokenNumber = details.tokenNumber || "1";
  const doctorName = details.doctorName || "Doctor";
  const appointmentDate = details.appointmentDate || new Date().toISOString().split("T")[0];
  const appointmentTime = details.appointmentTime || "09:00 AM - 10:00 AM";
  const appointmentId = details.appointmentId;

  return (
    <Layout title="Booking Confirmed">
      <div className="confirmation-card">
        {/* Light Green Banner Header */}
        <div className="confirmation-banner">
          <div className="check-icon-circle">✓</div>
          <h2>Appointment Confirmed!</h2>
          <p style={{ color: "var(--success-green)", fontSize: "14px" }}>
            Your consultation token has been generated successfully.
          </p>

          <div className="confirmation-token-box">
            <div style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--secondary-text)", fontWeight: 700 }}>
              YOUR TOKEN NUMBER
            </div>
            <div className="confirmation-token-number">
              {String(tokenNumber).startsWith("T") ? tokenNumber : `#${tokenNumber}`}
            </div>
          </div>
        </div>

        {/* Details Body */}
        <div className="confirmation-body">
          <div className="confirmation-details-list">
            <div className="confirmation-row">
              <span>Doctor:</span>
              <span>Dr. {doctorName}</span>
            </div>
            <div className="confirmation-row">
              <span>Appointment Date:</span>
              <span>{appointmentDate}</span>
            </div>
            <div className="confirmation-row">
              <span>Time Window:</span>
              <span>{appointmentTime}</span>
            </div>
            <div className="confirmation-row">
              <span>Hospital Location:</span>
              <span>ApexCare Main Clinic, Room 101</span>
            </div>
            <div className="confirmation-row" style={{ borderBottom: "none" }}>
              <span>Queue Status:</span>
              <span className="badge badge-booked">BOOKED / PENDING CHECK-IN</span>
            </div>
          </div>

          <div style={{ padding: "12px 16px", backgroundColor: "#E3F2FD", borderRadius: "8px", fontSize: "13px", color: "#0D47A1", marginBottom: "24px" }}>
            ℹ️ <strong>Patient Notice:</strong> Please arrive 15 minutes before your estimated time window. When you arrive at the clinic, the receptionist will check you in to enter the active doctor queue.
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              to={appointmentId ? `/token-status?id=${appointmentId}` : "/token-status"}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              View Token Status
            </Link>
            <Link
              to="/dashboard"
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentConfirmation;
