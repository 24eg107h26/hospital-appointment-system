import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const DoctorCallNext = () => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [queueCount, setQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await Api.get("/api/queue/doctor/today");
      const list = res.data || [];
      const inProgress = list.find((a) => a.status === "IN_PROGRESS");
      setCurrentPatient(inProgress || null);

      const waiting = list.filter((a) => a.status === "WAITING" || a.status === "BOOKED");
      setQueueCount(waiting.length);
    } catch {
      setError("Failed to fetch doctor queue status.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    setError("");
    setMessage("");
    try {
      const res = await Api.put("/api/queue/doctor/call-next");
      setCurrentPatient(res.data);
      setMessage(`Called Token #${res.data.tokenNumber} - ${res.data.patientName}`);
      fetchCurrentStatus();
    } catch (err) {
      setError(err.response?.data?.message || "Could not call next patient.");
    }
  };

  const handleComplete = async () => {
    if (!currentPatient) return;
    setError("");
    setMessage("");
    try {
      await Api.put(`/api/queue/doctor/${currentPatient.id}/complete`);
      setMessage(`Completed consultation for Token #${currentPatient.tokenNumber}.`);
      setCurrentPatient(null);
      fetchCurrentStatus();
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete appointment.");
    }
  };

  return (
    <Layout title="Call Next Patient">
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
              Doctor Consultation Desk
            </h2>
            <p style={{ color: "var(--secondary-text)", fontSize: "13px" }}>
              Date: <strong>{todayStr}</strong> | Patients Waiting in Line: <strong>{queueCount}</strong>
            </p>
          </div>

          <Link to="/doctor-queue" className="btn btn-secondary btn-sm">
            View Full Queue
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="card" style={{ textAlign: "center", padding: "36px 28px", border: "2px solid var(--primary-blue)" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--secondary-text)", textTransform: "uppercase", letterSpacing: "1px" }}>
            CURRENT PATIENT IN CONSULTATION
          </div>

          {currentPatient ? (
            <>
              <div style={{ fontSize: "64px", fontWeight: 900, color: "var(--primary-blue)", margin: "16px 0", lineHeight: 1 }}>
                #{currentPatient.tokenNumber}
              </div>

              <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
                {currentPatient.patientName}
              </h3>

              <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginBottom: "20px" }}>
                Reason: <strong>{currentPatient.reason || "General Consultation"}</strong>
              </p>

              <div style={{ display: "inline-block", marginBottom: "24px" }}>
                <span className="badge badge-progress" style={{ fontSize: "13px", padding: "6px 14px" }}>
                  ● Consultation In Progress
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ flex: 1, padding: "14px", fontSize: "15px" }}
                  onClick={handleComplete}
                >
                  ✓ Mark Completed
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "52px", fontWeight: 900, color: "var(--secondary-text)", margin: "20px 0" }}>
                --
              </div>
              <h3 style={{ fontSize: "18px", color: "var(--secondary-text)", marginBottom: "24px" }}>
                No Patient Currently in Consultation
              </h3>
            </>
          )}

          <div style={{ borderTop: "1px solid var(--border-light)", marginTop: "28px", paddingTop: "24px" }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ padding: "14px", fontSize: "16px" }}
              onClick={handleCallNext}
            >
              📢 Call Next Patient ({queueCount} Waiting)
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorCallNext;
