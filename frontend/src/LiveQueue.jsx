import React, { useState, useEffect } from "react";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const LiveQueue = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [queueList, setQueueList] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [nextWaitingToken, setNextWaitingToken] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const patientId = localStorage.getItem("patientId");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchQueueForDoctor(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [docsRes, myAppsRes] = await Promise.all([
        Api.get("/api/doctors/active"),
        Api.get("/api/appointments/my").catch(() => ({ data: [] }))
      ]);

      const docList = docsRes.data || [];
      setDoctors(docList);
      setMyAppointments(myAppsRes.data || []);

      if (docList.length > 0) {
        setSelectedDoctorId(docList[0].id);
      }
    } catch {
      setError("Failed to load doctors list.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueForDoctor = async (docId) => {
    setRefreshing(true);
    setError("");
    try {
      const res = await Api.get(`/api/appointments?date=${todayStr}&doctorId=${docId}`);
      const list = res.data || [];
      setQueueList(list);

      // Find current serving (IN_PROGRESS)
      const inProgress = list.find((a) => a.status === "IN_PROGRESS");
      setCurrentToken(inProgress ? inProgress.tokenNumber : null);

      // Find next in queue (lowest token with status WAITING or BOOKED)
      const waiting = list
        .filter((a) => a.status === "WAITING" || a.status === "BOOKED")
        .sort((a, b) => a.tokenNumber - b.tokenNumber);

      setNextWaitingToken(waiting.length > 0 ? waiting[0].tokenNumber : null);
    } catch (err) {
      setError("Failed to load queue for selected doctor.");
    } finally {
      setRefreshing(false);
    }
  };

  const myTokenNumbers = myAppointments
    .filter((a) => a.appointmentDate === todayStr && a.status !== "CANCELLED")
    .map((a) => a.tokenNumber);

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

  const selectedDoctorObj = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  return (
    <Layout title="Hospital Live Queue">
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
            Live Hospital Queue Monitor
          </h2>
          <p style={{ color: "var(--secondary-text)", fontSize: "13px" }}>
            Date: <strong>{todayStr}</strong> | Clinic Room: {selectedDoctorObj?.roomNumber ? `Room ${selectedDoctorObj.roomNumber}` : "Room 101"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            className="form-select"
            style={{ width: "240px" }}
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.name} ({d.specialization})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => selectedDoctorId && fetchQueueForDoctor(selectedDoctorId)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Top Large Display Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        <div className="card" style={{ textAlign: "center", padding: "24px", border: "2px solid var(--primary-blue)", backgroundColor: "#FFFFFF" }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--secondary-text)", fontWeight: 700 }}>
            CURRENT TOKEN SERVING
          </span>
          <div style={{ fontSize: "52px", fontWeight: 900, color: "var(--primary-blue)", lineHeight: 1.1, margin: "8px 0" }}>
            {currentToken != null ? (String(currentToken).startsWith("T") ? currentToken : `T${String(currentToken).padStart(3, "0")}`) : "--"}
          </div>
          <div style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
            {currentToken != null ? "Consultation In Progress" : "Doctor waiting for next patient"}
          </div>
        </div>

        <div className="card" style={{ textAlign: "center", padding: "24px", border: "2px solid #F9A825", backgroundColor: "#FFFFFF" }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--secondary-text)", fontWeight: 700 }}>
            NEXT TOKEN IN LINE
          </span>
          <div style={{ fontSize: "52px", fontWeight: 900, color: "#F9A825", lineHeight: 1.1, margin: "8px 0" }}>
            {nextWaitingToken != null ? (String(nextWaitingToken).startsWith("T") ? nextWaitingToken : `T${String(nextWaitingToken).padStart(3, "0")}`) : "None"}
          </div>
          <div style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
            {nextWaitingToken != null ? "Please proceed near consultation door" : "Queue is clear"}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="card">
        <div className="card-header">
          <h3>Active Queue Roster — Dr. {selectedDoctorObj?.name}</h3>
          <span style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
            {queueList.filter((a) => a.status !== "CANCELLED").length} active ticket(s)
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
            Loading live queue...
          </div>
        ) : queueList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
            No appointments booked today for Dr. {selectedDoctorObj?.name}.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Queue #</th>
                  <th>Token</th>
                  <th>Patient Name</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Queue Notice</th>
                </tr>
              </thead>
              <tbody>
                {queueList.map((app, index) => {
                  const isMyToken = myTokenNumbers.includes(app.tokenNumber);
                  const isCurrent = app.status === "IN_PROGRESS";

                  return (
                    <tr
                      key={app.id}
                      className={isMyToken ? "table-row-highlight" : ""}
                      style={{
                        backgroundColor: isMyToken
                          ? "#E3F2FD"
                          : isCurrent
                          ? "#FFFDE7"
                          : "inherit",
                        fontWeight: isMyToken ? 600 : "normal"
                      }}
                    >
                      <td>{index + 1}</td>
                      <td>
                        <strong style={{ fontSize: "15px", color: isMyToken ? "var(--primary-blue)" : "inherit" }}>
                          {app.tokenString || `T${String(app.tokenNumber).padStart(3, "0")}`}
                        </strong>
                      </td>
                      <td>
                        {isMyToken ? (
                          <span>{app.patientName} <span className="badge badge-progress" style={{ marginLeft: "6px" }}>You</span></span>
                        ) : (
                          // Privacy mask patient's last name for general queue view
                          app.patientName.split(" ")[0] + " ***"
                        )}
                      </td>
                      <td>{app.reason || "General Consultation"}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                          {app.status === "IN_PROGRESS" ? "● Serving" : app.status}
                        </span>
                      </td>
                      <td>
                        {isCurrent && (
                          <span style={{ color: "var(--primary-blue)", fontWeight: 700, fontSize: "12px" }}>
                            Current Patient
                          </span>
                        )}
                        {app.tokenNumber === nextWaitingToken && !isCurrent && (
                          <span style={{ color: "#F9A825", fontWeight: 700, fontSize: "12px" }}>
                            Up Next
                          </span>
                        )}
                        {isMyToken && !isCurrent && app.tokenNumber !== nextWaitingToken && (
                          <span style={{ color: "var(--secondary-text)", fontSize: "12px" }}>
                            Your Ticket
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

export default LiveQueue;
