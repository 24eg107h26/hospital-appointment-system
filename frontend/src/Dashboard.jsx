import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "";
  const name = localStorage.getItem("name") || "User";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Patient states
  const [myAppointments, setMyAppointments] = useState([]);
  const [todayAppointment, setTodayAppointment] = useState(null);
  const [tokenStatus, setTokenStatus] = useState(null);

  // Doctor states
  const [doctorQueue, setDoctorQueue] = useState([]);
  const [doctorStats, setDoctorStats] = useState({ today: 0, completed: 0, waiting: 0, cancelled: 0 });

  // Admin states
  const [adminSummary, setAdminSummary] = useState({ booked: 0, waiting: 0, inProgress: 0, completed: 0, cancelled: 0 });
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [recentAppointments, setRecentAppointments] = useState([]);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      if (role === "PATIENT") {
        const res = await Api.get("/api/appointments/my");
        const apps = res.data || [];
        setMyAppointments(apps);

        // Find today's active appointment
        const todayApp = apps.find(
          (a) => a.appointmentDate === todayStr && a.status !== "CANCELLED" && a.status !== "COMPLETED"
        ) || apps.find((a) => a.appointmentDate === todayStr);

        if (todayApp) {
          setTodayAppointment(todayApp);
          try {
            const statusRes = await Api.get(`/api/queue/status/${todayApp.id}`);
            setTokenStatus(statusRes.data);
          } catch {
            // Queue status may fail if doctor hasn't started yet
          }
        }
      } else if (role === "DOCTOR") {
        const queueRes = await Api.get("/api/queue/doctor/today");
        const list = queueRes.data || [];
        setDoctorQueue(list);

        const completed = list.filter((a) => a.status === "COMPLETED").length;
        const waiting = list.filter((a) => a.status === "WAITING" || a.status === "BOOKED").length;
        const cancelled = list.filter((a) => a.status === "CANCELLED").length;

        setDoctorStats({
          today: list.length,
          completed,
          waiting,
          cancelled
        });
      } else if (role === "ADMIN") {
        const [statsRes, appsRes] = await Promise.allSettled([
          Api.get("/api/dashboard/stats"),
          Api.get(`/api/appointments?date=${todayStr}`)
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value.data) {
          const s = statsRes.value.data;
          setAdminSummary({
            totalPatients: s.totalPatients,
            totalDoctors: s.totalDoctors,
            totalDepartments: s.totalDepartments,
            today: s.todayAppointments,
            waiting: s.waitingPatients,
            completed: s.completedAppointments,
            cancelled: s.cancelledAppointments,
            inProgress: s.inProgressAppointments,
            currentServingToken: s.currentServingToken,
            nextToken: s.nextToken,
            nextPatientName: s.nextPatientName
          });
          setTotalDoctors(s.totalDoctors);
          setTotalPatients(s.totalPatients);
        }
        if (appsRes.status === "fulfilled") {
          setRecentAppointments(appsRes.value.data || []);
        }
      }
    } catch (err) {
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorCallNext = async () => {
    try {
      await Api.put("/api/queue/doctor/call-next");
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to call next patient");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "BOOKED":
        return "badge-booked";
      case "WAITING":
        return "badge-waiting";
      case "IN_PROGRESS":
        return "badge-progress";
      case "COMPLETED":
        return "badge-completed";
      case "CANCELLED":
        return "badge-cancelled";
      default:
        return "badge";
    }
  };

  return (
    <Layout title="Dashboard">
      {error && <div className="alert alert-error">{error}</div>}

      {/* =========================================================================
          PATIENT DASHBOARD VIEW
          ========================================================================= */}
      {role === "PATIENT" && (
        <>
          <div className="card" style={{ backgroundColor: "#FFFFFF", padding: "20px 24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
              Welcome back, {name}!
            </h2>
            <p style={{ color: "var(--secondary-text)", fontSize: "14px", marginTop: "4px" }}>
              Track your medical tokens, view upcoming specialist consultations, or book a new appointment.
            </p>
          </div>

          {/* Today's Appointment Hero Card */}
          {todayAppointment ? (
            <div className="hero-appointment-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="badge badge-progress" style={{ marginBottom: "8px" }}>
                    Today's Active Booking
                  </span>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginTop: "4px" }}>
                    Dr. {todayAppointment.doctorName}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
                    Date: <strong>{todayAppointment.appointmentDate}</strong> | Reason: {todayAppointment.reason || "General Consultation"}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${getStatusBadgeClass(todayAppointment.status)}`}>
                    Status: {todayAppointment.status}
                  </span>
                </div>
              </div>

              <div className="hero-appointment-grid">
                <div className="hero-token-box">
                  <div className="hero-token-number">#{todayAppointment.tokenNumber}</div>
                  <div className="hero-token-label">Your Token</div>
                </div>

                <div className="hero-token-box" style={{ backgroundColor: "#FAFAFA", borderColor: "#E0E0E0" }}>
                  <div className="hero-token-number" style={{ color: "var(--text)" }}>
                    {tokenStatus?.currentToken != null ? `#${tokenStatus.currentToken}` : "--"}
                  </div>
                  <div className="hero-token-label" style={{ color: "var(--secondary-text)" }}>
                    Current Serving
                  </div>
                </div>

                <div className="hero-token-box" style={{ backgroundColor: "#FFF8E1", borderColor: "#FFE082" }}>
                  <div className="hero-token-number" style={{ color: "#F57F17" }}>
                    {tokenStatus?.patientsAhead != null ? tokenStatus.patientsAhead : "0"}
                  </div>
                  <div className="hero-token-label" style={{ color: "#F57F17" }}>
                    Patients Ahead
                  </div>
                </div>

                <div className="hero-token-box" style={{ backgroundColor: "#E8F5E9", borderColor: "#C8E6C9" }}>
                  <div className="hero-token-number" style={{ color: "var(--success-green)", fontSize: "28px" }}>
                    {tokenStatus?.patientsAhead != null ? `~${tokenStatus.patientsAhead * 10} min` : "Ready"}
                  </div>
                  <div className="hero-token-label" style={{ color: "var(--success-green)" }}>
                    Estimated Wait
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
                <Link to={`/token-status`} className="btn btn-primary btn-sm">
                  View Full Token Details
                </Link>
                <Link to="/live-queue" className="btn btn-secondary btn-sm">
                  View Live Queue
                </Link>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>📅</div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>
                No Appointments Scheduled for Today
              </h3>
              <p style={{ color: "var(--secondary-text)", fontSize: "13px", marginTop: "4px", marginBottom: "16px" }}>
                Need to see a doctor? Select a specialist and generate your consultation token online.
              </p>
              <Link to="/doctors" className="btn btn-primary btn-sm">
                Browse Doctors &amp; Book Now
              </Link>
            </div>
          )}

          {/* Patient Statistics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Bookings</span>
                <div className="stat-icon">📑</div>
              </div>
              <div className="stat-value">{myAppointments.length}</div>
              <div className="stat-desc">All registered appointments</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Today's Appointment</span>
                <div className="stat-icon">🩺</div>
              </div>
              <div className="stat-value">{todayAppointment ? "1 Active" : "None"}</div>
              <div className="stat-desc">Scheduled for {todayStr}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Current Token</span>
                <div className="stat-icon">🎫</div>
              </div>
              <div className="stat-value">
                {todayAppointment ? `#${todayAppointment.tokenNumber}` : "--"}
              </div>
              <div className="stat-desc">Your queue ticket</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Waiting Patients</span>
                <div className="stat-icon">⏳</div>
              </div>
              <div className="stat-value">
                {tokenStatus?.patientsAhead != null ? tokenStatus.patientsAhead : 0}
              </div>
              <div className="stat-desc">Ahead in your doctor's queue</div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <Link to="/doctors" className="btn btn-secondary" style={{ padding: "16px", justifyContent: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>👨‍⚕️</span> Find Doctors
              </Link>
              <Link to="/book-appointment" className="btn btn-secondary" style={{ padding: "16px", justifyContent: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>📅</span> Book Appointment
              </Link>
              <Link to="/my-appointments" className="btn btn-secondary" style={{ padding: "16px", justifyContent: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>📋</span> My Booking History
              </Link>
              <Link to="/live-queue" className="btn btn-secondary" style={{ padding: "16px", justifyContent: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>⏱️</span> Check Hospital Queue
              </Link>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          DOCTOR DASHBOARD VIEW
          ========================================================================= */}
      {role === "DOCTOR" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
                Doctor Consultation Dashboard
              </h2>
              <p style={{ color: "var(--secondary-text)", fontSize: "13px" }}>
                Date: <strong>{todayStr}</strong> | Manage your active daily patient queue.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDoctorCallNext}
              >
                📢 Call Next Patient
              </button>
              <Link to="/doctor-queue" className="btn btn-secondary">
                View Full Queue
              </Link>
            </div>
          </div>

          {/* Doctor Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Today's Appointments</span>
                <div className="stat-icon">📅</div>
              </div>
              <div className="stat-value">{doctorStats.today}</div>
              <div className="stat-desc">Booked for consultation today</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Completed</span>
                <div className="stat-icon" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>✓</div>
              </div>
              <div className="stat-value">{doctorStats.completed}</div>
              <div className="stat-desc">Patients examined today</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Waiting in Queue</span>
                <div className="stat-icon" style={{ backgroundColor: "#FFF8E1", color: "#F57F17" }}>⏳</div>
              </div>
              <div className="stat-value">{doctorStats.waiting}</div>
              <div className="stat-desc">Pending in waiting room</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Cancelled</span>
                <div className="stat-icon" style={{ backgroundColor: "#FFEBEE", color: "#D32F2F" }}>✕</div>
              </div>
              <div className="stat-value">{doctorStats.cancelled}</div>
              <div className="stat-desc">Cancelled by patients</div>
            </div>
          </div>

          {/* Today's Queue Table */}
          <div className="card">
            <div className="card-header">
              <h3>Today's Patient Queue</h3>
              <span style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
                {doctorQueue.length} patient(s) in roster
              </span>
            </div>

            {doctorQueue.length === 0 ? (
              <p style={{ color: "var(--secondary-text)", padding: "16px 0", textAlign: "center" }}>
                No appointments booked for today.
              </p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Patient Name</th>
                      <th>Reason for Visit</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorQueue.map((app) => {
                      const isCurrent = app.status === "IN_PROGRESS";
                      return (
                        <tr key={app.id} className={isCurrent ? "table-row-highlight" : ""}>
                          <td>
                            <strong>#{app.tokenNumber}</strong>
                          </td>
                          <td>{app.patientName}</td>
                          <td>{app.reason || "General Consultation"}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {isCurrent ? (
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={async () => {
                                  await Api.put(`/api/queue/doctor/${app.id}/complete`);
                                  fetchDashboardData();
                                }}
                              >
                                Mark Completed
                              </button>
                            ) : (
                              <span style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                                {app.status === "COMPLETED" ? "Done" : "Queued"}
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
        </>
      )}

      {/* =========================================================================
          ADMIN DASHBOARD VIEW
          ========================================================================= */}
      {role === "ADMIN" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
                Hospital Administration Overview
              </h2>
              <p style={{ color: "var(--secondary-text)", fontSize: "13px" }}>
                Live hospital activity for <strong>{todayStr}</strong>.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/manage-doctors" className="btn btn-primary">
                + Add / Manage Doctors
              </Link>
              <Link to="/queue-management" className="btn btn-secondary">
                Queue Reception Desk
              </Link>
            </div>
          </div>

          {/* Admin Stats Grid - 8 Required Metric Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Patients</span>
                <div className="stat-icon">👥</div>
              </div>
              <div className="stat-value">{adminSummary.totalPatients ?? totalPatients}</div>
              <div className="stat-desc">Registered patients</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Doctors</span>
                <div className="stat-icon">👨‍⚕️</div>
              </div>
              <div className="stat-value">{adminSummary.totalDoctors ?? totalDoctors}</div>
              <div className="stat-desc">Active specialists</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Today's Appointments</span>
                <div className="stat-icon">📑</div>
              </div>
              <div className="stat-value">{adminSummary.today ?? 0}</div>
              <div className="stat-desc">Booked for today ({todayStr})</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Waiting Patients</span>
                <div className="stat-icon" style={{ backgroundColor: "#FFF8E1", color: "#F57F17" }}>⏳</div>
              </div>
              <div className="stat-value">{adminSummary.waiting ?? 0}</div>
              <div className="stat-desc">In queue / waiting room</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Completed</span>
                <div className="stat-icon" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>✓</div>
              </div>
              <div className="stat-value">{adminSummary.completed ?? 0}</div>
              <div className="stat-desc">Consultations finished</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Cancelled</span>
                <div className="stat-icon" style={{ backgroundColor: "#FFEBEE", color: "#C62828" }}>✕</div>
              </div>
              <div className="stat-value">{adminSummary.cancelled ?? 0}</div>
              <div className="stat-desc">Cancelled appointments</div>
            </div>

            <div className="stat-card" style={{ borderLeft: "4px solid var(--primary-blue)" }}>
              <div className="stat-header">
                <span className="stat-title">Current Serving Token</span>
                <div className="stat-icon" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>📢</div>
              </div>
              <div className="stat-value" style={{ color: "var(--primary-blue)" }}>
                {adminSummary.currentServingToken || "None"}
              </div>
              <div className="stat-desc">Currently in consultation</div>
            </div>

            <div className="stat-card" style={{ borderLeft: "4px solid #E65100" }}>
              <div className="stat-header">
                <span className="stat-title">Next Patient in Queue</span>
                <div className="stat-icon" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>⏭️</div>
              </div>
              <div className="stat-value" style={{ color: "#E65100" }}>
                {adminSummary.nextToken || "None"}
              </div>
              <div className="stat-desc">{adminSummary.nextPatientName && adminSummary.nextPatientName !== "None" ? adminSummary.nextPatientName : "No waiting patient"}</div>
            </div>
          </div>

          {/* Today's Appointments Table Preview */}
          <div className="card">
            <div className="card-header">
              <h3>Today's Hospital Appointments</h3>
              <Link to="/manage-appointments" className="btn btn-secondary btn-sm">
                View All &amp; Manage
              </Link>
            </div>

            {recentAppointments.length === 0 ? (
              <p style={{ color: "var(--secondary-text)", textAlign: "center", padding: "16px 0" }}>
                No appointments booked today.
              </p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.slice(0, 10).map((app) => {
                      const tokenStr = app.tokenString || (app.tokenNumber ? `T${String(app.tokenNumber).padStart(3, "0")}` : "#1");
                      return (
                        <tr key={app.id}>
                          <td>
                            <strong style={{ color: "var(--primary-blue)" }}>{tokenStr}</strong>
                          </td>
                          <td>
                            <strong>{app.patientName}</strong>
                          </td>
                          <td>Dr. {app.doctorName}</td>
                          <td>
                            <span style={{ padding: "3px 8px", backgroundColor: "#F1F5F9", borderRadius: "10px", fontSize: "12px", fontWeight: 500 }}>
                              {app.departmentName || app.specialization || "General"}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px" }}>{app.appointmentTime || "09:00 AM - 10:00 AM"}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {app.status === "BOOKED" && (
                              <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                onClick={async () => {
                                  await Api.put(`/api/appointments/${app.id}/checkin`);
                                  fetchDashboardData();
                                }}
                              >
                                Check In
                              </button>
                            )}
                            {app.status === "WAITING" && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={async () => {
                                  await Api.put(`/api/queue/${app.id}/call`);
                                  fetchDashboardData();
                                }}
                              >
                                Call Patient
                              </button>
                            )}
                            {app.status === "IN_PROGRESS" && (
                              <span style={{ fontSize: "12px", color: "var(--primary-blue)", fontWeight: 600 }}>
                                In Room
                              </span>
                            )}
                            {app.status === "COMPLETED" && (
                              <span style={{ fontSize: "12px", color: "var(--success-green)", fontWeight: 600 }}>
                                Finished
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
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
