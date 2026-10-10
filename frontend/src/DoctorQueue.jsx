import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const DoctorQueue = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTodayQueue();
  }, []);

  const fetchTodayQueue = async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await Api.get("/api/queue/doctor/today");
      setAppointments(res.data || []);
    } catch {
      setError("Failed to load doctor's queue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCallNext = async () => {
    setError("");
    setMessage("");
    try {
      const res = await Api.put("/api/queue/doctor/call-next");
      const app = res.data;
      setMessage(`Now Serving: Token #${app.tokenNumber} - ${app.patientName}`);
      fetchTodayQueue();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to call next patient.");
    }
  };

  const handleComplete = async (id) => {
    setError("");
    setMessage("");
    try {
      await Api.put(`/api/queue/doctor/${id}/complete`);
      setMessage("Consultation marked as completed.");
      fetchTodayQueue();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete appointment.");
    }
  };

  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const waitingCount = appointments.filter((a) => a.status === "WAITING" || a.status === "BOOKED").length;
  const cancelledCount = appointments.filter((a) => a.status === "CANCELLED").length;
  const currentPatient = appointments.find((a) => a.status === "IN_PROGRESS");

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "badge-progress";
      case "WAITING":
        return "badge-waiting";
      case "BOOKED":
        return "badge-booked";
      case "COMPLETED":
        return "badge-completed";
      case "CANCELLED":
        return "badge-cancelled";
      default:
        return "badge";
    }
  };

  return (
    <Layout title="Doctor's Daily Queue">
      {/* Top Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
            Today's Patient Consultations
          </h2>
          <p style={{ color: "var(--secondary-text)", fontSize: "13px" }}>
            Date: <strong>{todayStr}</strong> | Clinic Consultation Queue
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchTodayQueue}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>

          <Link to="/doctor/call-next" className="btn btn-secondary btn-sm">
            Standalone Call Screen
          </Link>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCallNext}
          >
            📢 Call Next Patient
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Top 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Today's Appointments</span>
            <div className="stat-icon">📅</div>
          </div>
          <div className="stat-value">{appointments.length}</div>
          <div className="stat-desc">Total bookings for today</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Completed</span>
            <div className="stat-icon" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>✓</div>
          </div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-desc">Consultations finished</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Waiting Patients</span>
            <div className="stat-icon" style={{ backgroundColor: "#FFF8E1", color: "#F57F17" }}>⏳</div>
          </div>
          <div className="stat-value">{waitingCount}</div>
          <div className="stat-desc">Patients in queue</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Cancelled</span>
            <div className="stat-icon" style={{ backgroundColor: "#FFEBEE", color: "#D32F2F" }}>✕</div>
          </div>
          <div className="stat-value">{cancelledCount}</div>
          <div className="stat-desc">Cancelled tokens</div>
        </div>
      </div>

      {/* Active Consultation Hero Card (if someone is IN_PROGRESS) */}
      {currentPatient && (
        <div className="card" style={{ border: "2px solid var(--primary-blue)", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "54px", height: "54px", backgroundColor: "var(--light-blue)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "var(--dark-blue)", fontWeight: 800 }}>
                #{currentPatient.tokenNumber}
              </div>
              <div>
                <span className="badge badge-progress" style={{ marginBottom: "4px" }}>
                  Currently In Consultation Room
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0" }}>
                  {currentPatient.patientName}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
                  Reason: <strong>{currentPatient.reason || "General Consultation"}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-success"
              onClick={() => handleComplete(currentPatient.id)}
            >
              ✓ Complete Consultation
            </button>
          </div>
        </div>
      )}

      {/* Today's Queue Table */}
      <div className="card">
        <div className="card-header">
          <h3>Sequential Consultation Queue</h3>
          <span style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
            Token order from lowest to highest
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
            Loading patient queue...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🩺</div>
            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>No Patients in Queue Today</h3>
            <p style={{ color: "var(--secondary-text)", fontSize: "13px", marginTop: "4px" }}>
              Appointments booked by patients will appear here in sequential token order.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient Name</th>
                  <th>Clinical Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => {
                  const isInProgress = app.status === "IN_PROGRESS";
                  return (
                    <tr
                      key={app.id}
                      className={isInProgress ? "table-row-highlight" : ""}
                    >
                      <td>
                        <strong style={{ fontSize: "16px", color: isInProgress ? "var(--primary-blue)" : "inherit" }}>
                          #{app.tokenNumber}
                        </strong>
                      </td>
                      <td>
                        <strong>{app.patientName}</strong>
                      </td>
                      <td>{app.reason || "General Consultation"}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                          {app.status === "IN_PROGRESS" ? "● In Consultation" : app.status}
                        </span>
                      </td>
                      <td>
                        {isInProgress && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => handleComplete(app.id)}
                          >
                            Mark Completed
                          </button>
                        )}
                        {app.status === "COMPLETED" && (
                          <span style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: 600 }}>
                            ✓ Finished
                          </span>
                        )}
                        {app.status === "WAITING" && (
                          <span style={{ fontSize: "12px", color: "#F57F17", fontWeight: 600 }}>
                            Ready in Hall
                          </span>
                        )}
                        {app.status === "BOOKED" && (
                          <span style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                            Awaiting Check-in
                          </span>
                        )}
                        {app.status === "CANCELLED" && (
                          <span style={{ fontSize: "12px", color: "var(--danger-red)" }}>
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorQueue;
