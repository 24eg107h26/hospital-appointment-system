import React, { useState, useEffect } from "react";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const ManageAppointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [appointments, setAppointments] = useState([]);
  const [queueSummary, setQueueSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Api.get("/api/doctors?all=true")
      .then((res) => setDoctors(res.data || []))
      .catch(() => {});

    Api.get("/api/departments")
      .then((res) => setDepartments(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedDoctorId]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const params = {
      date: selectedDate || undefined,
      doctorId: selectedDoctorId || undefined,
    };

    try {
      const [apptRes, queueRes] = await Promise.all([
        Api.get("/api/appointments", { params }),
        Api.get("/api/queue/admin", { params }),
      ]);
      setAppointments(apptRes.data || []);
      setQueueSummary(queueRes.data || []);
    } catch (err) {
      setError("Failed to load appointments or queue summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedDoctorId("");
    setSelectedDeptId("");
    setSelectedStatus("");
    setSearchTerm("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleCheckIn = async (appointmentId) => {
    setError("");
    setMessage("");
    try {
      await Api.put(`/api/appointments/${appointmentId}/checkin`);
      setMessage("Patient checked in successfully (status changed to WAITING).");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed.");
    }
  };

  const handleCallPatient = async (appointmentId) => {
    setError("");
    setMessage("");
    try {
      await Api.put(`/api/queue/${appointmentId}/call`);
      setMessage("Patient called into consultation room (status: IN_PROGRESS).");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const handleComplete = async (appointmentId) => {
    setError("");
    setMessage("");
    try {
      await Api.put(`/api/queue/${appointmentId}/complete`);
      setMessage("Appointment marked as COMPLETED.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await Api.put(`/api/appointments/${appointmentId}/cancel`);
      setMessage("Appointment cancelled successfully.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation failed.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "BOOKED":
        return <span className="badge badge-booked">Booked</span>;
      case "WAITING":
        return <span className="badge badge-waiting">Checked In</span>;
      case "IN_PROGRESS":
        return <span className="badge badge-progress">● Consulting</span>;
      case "COMPLETED":
        return <span className="badge badge-completed">✓ Completed</span>;
      case "CANCELLED":
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // Filtered appointments on frontend
  const filteredAppointments = appointments.filter((apt) => {
    const formattedToken = apt.tokenString || (apt.tokenNumber ? `T${String(apt.tokenNumber).padStart(3, "0")}` : "");

    const matchesSearch =
      !searchTerm ||
      (apt.patientName && apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (apt.doctorName && apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (apt.patientPhone && apt.patientPhone.includes(searchTerm)) ||
      (formattedToken && formattedToken.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(apt.tokenNumber).includes(searchTerm);

    const matchesDept =
      !selectedDeptId ||
      (apt.departmentName && departments.find((d) => String(d.id) === String(selectedDeptId))?.name === apt.departmentName);

    const matchesStatus =
      !selectedStatus || apt.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Aggregate counts for summary banner
  const totals = queueSummary.reduce(
    (acc, curr) => ({
      booked: acc.booked + (curr.bookedCount || 0),
      waiting: acc.waiting + (curr.waitingCount || 0),
      inProgress: acc.inProgress + (curr.inProgressCount || 0),
      completed: acc.completed + (curr.completedCount || 0),
      cancelled: acc.cancelled + (curr.cancelledCount || 0),
      total: acc.total + (curr.totalAppointments || 0),
    }),
    { booked: 0, waiting: 0, inProgress: 0, completed: 0, cancelled: 0, total: 0 }
  );

  return (
    <Layout title="Manage Appointments">
      <div style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "40px" }}>
        {/* Filter Controls Card */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
            <h3>Filter Appointments &amp; Live Queue</h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={fetchData}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginTop: "14px" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="filter-search">Search Patient or Token</label>
              <input
                id="filter-search"
                type="text"
                className="form-input"
                placeholder="e.g. John or T001..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="filter-date">Appointment Date</label>
              <input
                id="filter-date"
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="filter-dept">Department</label>
              <select
                id="filter-dept"
                className="form-select"
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="filter-doc">Doctor / Specialist</label>
              <select
                id="filter-doc"
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="">All Doctors</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="BOOKED">BOOKED</option>
                <option value="WAITING">WAITING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Queue Summary KPI Row */}
        <div
          className="card"
          style={{
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            padding: "16px 20px",
            marginBottom: "20px"
          }}
        >
          <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: "12px", fontSize: "13px" }}>
            Queue Status Overview for {selectedDate || "All Dates"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "10px",
            }}
          >
            <div style={{ background: "#FFFFFF", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--secondary-text)", textTransform: "uppercase" }}>Total</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)" }}>{totals.total}</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "#F57F17", textTransform: "uppercase" }}>Booked</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#E65100" }}>{totals.booked}</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "#E65100", textTransform: "uppercase" }}>Waiting</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#BF360C" }}>{totals.waiting}</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--primary-blue)", textTransform: "uppercase" }}>In Progress</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--dark-blue)" }}>{totals.inProgress}</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--success-green)", textTransform: "uppercase" }}>Completed</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--success-green)" }}>{totals.completed}</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--danger-red)", textTransform: "uppercase" }}>Cancelled</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--danger-red)" }}>{totals.cancelled}</div>
            </div>
          </div>
        </div>

        {/* Appointments Table Card */}
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "16px 20px" }}>
            <h3>Consultation Bookings</h3>
            <span style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
              Showing {filteredAppointments.length} record{filteredAppointments.length === 1 ? "" : "s"}
            </span>
          </div>

          {error && <div style={{ margin: "16px 20px" }} className="alert alert-error">{error}</div>}
          {message && <div style={{ margin: "16px 20px" }} className="alert alert-success">{message}</div>}

          {loading ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px", color: "var(--secondary-text)" }}>
              No appointments found matching selected filters.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "90px" }}>Token</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Time Session</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Queue / Reception Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => {
                    const tokenBadge = apt.tokenString || `T${String(apt.tokenNumber).padStart(3, "0")}`;
                    return (
                      <tr key={apt.id}>
                        <td>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            backgroundColor: "#EFF6FF",
                            color: "var(--primary-blue)",
                            borderRadius: "6px",
                            fontWeight: 800,
                            fontSize: "14px",
                            border: "1px solid #BFDBFE"
                          }}>
                            {tokenBadge}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#1E293B" }}>{apt.patientName}</div>
                          {apt.patientPhone && (
                            <div style={{ fontSize: "11px", color: "var(--secondary-text)" }}>{apt.patientPhone}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>Dr. {apt.doctorName}</div>
                          <div style={{ fontSize: "12px", color: "var(--secondary-text)" }}>{apt.specialization}</div>
                        </td>
                        <td>
                          <span style={{ padding: "3px 8px", backgroundColor: "#F1F5F9", borderRadius: "10px", fontSize: "12px", fontWeight: 500, color: "#475569" }}>
                            {apt.departmentName || "General"}
                          </span>
                        </td>
                        <td style={{ fontSize: "13px" }}>{apt.appointmentTime || "09:00 AM - 10:00 AM"}</td>
                        <td>{getStatusBadge(apt.status)}</td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                            {apt.status === "BOOKED" && (
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => handleCheckIn(apt.id)}
                              >
                                Check In
                              </button>
                            )}
                            {apt.status === "WAITING" && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleCallPatient(apt.id)}
                              >
                                Call Patient
                              </button>
                            )}
                            {apt.status === "IN_PROGRESS" && (
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => handleComplete(apt.id)}
                              >
                                Complete
                              </button>
                            )}
                            {(apt.status === "BOOKED" || apt.status === "WAITING") && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleCancel(apt.id)}
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
      </div>
    </Layout>
  );
};

export default ManageAppointments;
