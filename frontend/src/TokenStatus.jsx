import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const TokenStatus = () => {
  const [searchParams] = useSearchParams();
  const appointmentIdParam = searchParams.get("id");

  const [myAppointments, setMyAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointmentIdParam || "");
  const [tokenStatus, setTokenStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedAppointmentId) {
      fetchStatus(selectedAppointmentId);
    }
  }, [selectedAppointmentId]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await Api.get("/api/appointments/my");
      const list = res.data || [];
      setMyAppointments(list);

      if (appointmentIdParam) {
        setSelectedAppointmentId(appointmentIdParam);
      } else if (list.length > 0) {
        // Pick the first non-cancelled appointment, or the latest
        const active = list.find((a) => a.status !== "CANCELLED" && a.status !== "COMPLETED") || list[0];
        setSelectedAppointmentId(active.id);
      }
    } catch {
      setError("Failed to load your appointments.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async (appId) => {
    setRefreshing(true);
    setError("");
    try {
      const res = await Api.get(`/api/queue/status/${appId}`);
      setTokenStatus(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not retrieve live queue status.";
      setError(msg);
      setTokenStatus(null);
    } finally {
      setRefreshing(false);
    }
  };

  const currentApp = myAppointments.find((a) => String(a.id) === String(selectedAppointmentId));

  const getStatusBadge = (status) => {
    switch (status) {
      case "BOOKED":
        return <span className="badge badge-booked">Waiting for Reception Check-in</span>;
      case "WAITING":
        return <span className="badge badge-waiting">In Queue (Waiting Room)</span>;
      case "IN_PROGRESS":
        return <span className="badge badge-progress">● In Consultation with Doctor</span>;
      case "COMPLETED":
        return <span className="badge badge-completed">✓ Consultation Completed</span>;
      case "CANCELLED":
        return <span className="badge badge-cancelled">✕ Appointment Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // Progress Step Calculation
  const getStepClass = (stepName) => {
    const status = tokenStatus?.status || currentApp?.status;
    if (status === "CANCELLED") return "";

    const order = ["BOOKED", "WAITING", "IN_PROGRESS", "COMPLETED"];
    const currentIndex = order.indexOf(status);
    const targetIndex = order.indexOf(stepName);

    if (currentIndex > targetIndex) return "step-completed";
    if (currentIndex === targetIndex) return "step-active";
    return "";
  };

  return (
    <Layout title="Live Token Tracker">
      <div className="token-status-wrapper">
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
              Token Queue Status
            </h2>
            <p style={{ color: "var(--secondary-text)", fontSize: "13px" }}>
              Real-time monitoring of your place in line.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => selectedAppointmentId && fetchStatus(selectedAppointmentId)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Appointment Selector if patient has appointments */}
        {myAppointments.length > 1 && (
          <div className="card" style={{ padding: "14px 20px", marginBottom: "20px" }}>
            <label className="form-label" style={{ fontSize: "12px" }}>
              Select Appointment to Track:
            </label>
            <select
              className="form-select"
              value={selectedAppointmentId}
              onChange={(e) => setSelectedAppointmentId(e.target.value)}
            >
              {myAppointments.map((app) => (
                <option key={app.id} value={app.id}>
                  Token #{app.tokenNumber} — Dr. {app.doctorName} ({app.appointmentDate}) [{app.status}]
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            Loading token details...
          </div>
        ) : !currentApp ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎫</div>
            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>No Active Tokens Found</h3>
            <p style={{ color: "var(--secondary-text)", fontSize: "13px", marginTop: "4px", marginBottom: "16px" }}>
              You don't have any appointments booked yet.
            </p>
            <Link to="/doctors" className="btn btn-primary btn-sm">
              Book a Specialist Now
            </Link>
          </div>
        ) : (
          <div className="token-hero-card">
            <div className="token-hero-title">Your Assigned Token</div>

            <div className="token-hero-number">
              #{tokenStatus?.myToken || currentApp.tokenNumber}
            </div>

            <div style={{ marginBottom: "16px" }}>
              {getStatusBadge(tokenStatus?.status || currentApp.status)}
            </div>

            {/* Waiting Message / Call Banner */}
            {tokenStatus?.status === "IN_PROGRESS" ? (
              <div className="alert alert-success" style={{ justifyContent: "center", fontWeight: 700, fontSize: "15px" }}>
                🔔 IT IS YOUR TURN! Please enter the doctor's consultation room.
              </div>
            ) : tokenStatus?.status === "CANCELLED" ? (
              <div className="alert alert-error" style={{ justifyContent: "center" }}>
                This appointment was cancelled and will not be called in the queue.
              </div>
            ) : (
              <div className="token-wait-banner">
                {tokenStatus?.message || `${tokenStatus?.patientsAhead || 0} patient(s) ahead of you in queue.`}
              </div>
            )}

            {/* Token Progress Steps */}
            <div className="progress-steps">
              <div className={`progress-step ${getStepClass("BOOKED")}`}>
                <div className="step-circle">1</div>
                <div className="step-label">Booked</div>
              </div>

              <div className={`progress-step ${getStepClass("WAITING")}`}>
                <div className="step-circle">2</div>
                <div className="step-label">Checked In</div>
              </div>

              <div className={`progress-step ${getStepClass("IN_PROGRESS")}`}>
                <div className="step-circle">3</div>
                <div className="step-label">In Progress</div>
              </div>

              <div className={`progress-step ${getStepClass("COMPLETED")}`}>
                <div className="step-circle">4</div>
                <div className="step-label">Completed</div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="token-meta-box">
              <div className="token-meta-item">
                <div className="label">Current Token Serving</div>
                <div className="value">
                  {tokenStatus?.currentToken != null ? `#${tokenStatus.currentToken}` : "Not started"}
                </div>
              </div>

              <div className="token-meta-item">
                <div className="label">Patients Ahead</div>
                <div className="value" style={{ color: "#F57F17" }}>
                  {tokenStatus?.patientsAhead != null ? tokenStatus.patientsAhead : 0}
                </div>
              </div>

              <div className="token-meta-item">
                <div className="label">Doctor</div>
                <div className="value">Dr. {currentApp.doctorName}</div>
              </div>

              <div className="token-meta-item">
                <div className="label">Appointment Date</div>
                <div className="value">{currentApp.appointmentDate}</div>
              </div>

              <div className="token-meta-item">
                <div className="label">Est. Waiting Time</div>
                <div className="value" style={{ color: "var(--primary-blue)" }}>
                  {tokenStatus?.patientsAhead ? `~${tokenStatus.patientsAhead * 10} minutes` : "Under 5 mins"}
                </div>
              </div>

              <div className="token-meta-item">
                <div className="label">Clinic Room</div>
                <div className="value">Room 101</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <Link to="/live-queue" className="btn btn-secondary" style={{ flex: 1 }}>
                View Full Live Queue
              </Link>
              <Link to="/my-appointments" className="btn btn-secondary" style={{ flex: 1 }}>
                My Appointments
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TokenStatus;
