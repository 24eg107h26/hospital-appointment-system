import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await Api.get("/api/appointments/my");
      setAppointments(res.data || []);
    } catch {
      setError("Failed to fetch your appointments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment? Your token will be released.")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await Api.put(`/api/appointments/${id}/cancel`);
      setSuccess("Appointment cancelled successfully.");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "BOOKED":
        return <span className="badge badge-booked">Booked (Pending Check-in)</span>;
      case "WAITING":
        return <span className="badge badge-waiting">Checked In (Waiting Room)</span>;
      case "IN_PROGRESS":
        return <span className="badge badge-progress">● In Consultation</span>;
      case "COMPLETED":
        return <span className="badge badge-completed">✓ Completed</span>;
      case "CANCELLED":
        return <span className="badge badge-cancelled">✕ Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <Layout title="My Appointments">
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
            Consultation History &amp; Active Bookings
          </h2>
          <p style={{ color: "var(--secondary-text)", fontSize: "13px" }}>
            Track token statuses, clinic visits, or cancel upcoming bookings.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchAppointments}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
          <Link to="/book-appointment" className="btn btn-primary btn-sm">
            + New Appointment
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
            Loading your appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📋</div>
            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>No Appointments Found</h3>
            <p style={{ color: "var(--secondary-text)", fontSize: "13px", marginTop: "4px", marginBottom: "16px" }}>
              You have not booked any appointments yet.
            </p>
            <Link to="/doctors" className="btn btn-primary btn-sm">
              Explore Doctors &amp; Book
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => {
                  const canCancel = app.status === "BOOKED" || app.status === "WAITING";
                  return (
                    <tr key={app.id}>
                      <td>
                        <strong style={{ fontSize: "16px", color: "var(--primary-blue)" }}>
                          {app.tokenString || `T${String(app.tokenNumber).padStart(3, "0")}`}
                        </strong>
                      </td>
                      <td>
                        <strong>Dr. {app.doctorName}</strong>
                      </td>
                      <td>{app.departmentName || app.specialization || "General Medicine"}</td>
                      <td>
                        <div>{app.appointmentDate}</div>
                        <div style={{ fontSize: "11px", color: "var(--secondary-text)" }}>{app.appointmentTime || "09:00 AM"}</div>
                      </td>
                      <td>{app.reason || "General Consultation"}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/token-status?id=${app.id}`)}
                          >
                            View Token
                          </button>

                          {canCancel && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(app.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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

export default MyAppointments;
