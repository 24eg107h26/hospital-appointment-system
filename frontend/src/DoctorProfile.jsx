import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    try {
      const [docRes, schedRes] = await Promise.all([
        Api.get(`/api/doctors/${doctorId}`),
        Api.get(`/api/schedules/doctor/${doctorId}`)
      ]);
      setDoctor(docRes.data);
      setSchedules(schedRes.data || []);
    } catch {
      setError("Failed to load doctor profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Doctor Profile">
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          Loading doctor profile...
        </div>
      </Layout>
    );
  }

  if (error || !doctor) {
    return (
      <Layout title="Doctor Profile">
        <div className="alert alert-error">{error || "Doctor not found."}</div>
        <Link to="/doctors" className="btn btn-secondary">
          &larr; Back to Doctors List
        </Link>
      </Layout>
    );
  }

  return (
    <Layout title={`Dr. ${doctor.name} - Profile`}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/doctors" className="btn btn-secondary btn-sm">
          &larr; Back to All Doctors
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Left Doctor Overview Card */}
        <div className="card" style={{ textAlign: "center" }}>
          <div
            className="doctor-avatar"
            style={{ width: "96px", height: "96px", fontSize: "40px", margin: "0 auto 16px auto", borderRadius: "50%" }}
          >
            👨‍⚕️
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
            Dr. {doctor.name}
          </h2>
          <div style={{ color: "var(--primary-blue)", fontWeight: 600, fontSize: "14px", marginTop: "2px" }}>
            {doctor.specialization}
          </div>
          <div style={{ color: "var(--secondary-text)", fontSize: "13px", marginTop: "2px" }}>
            {doctor.qualification || "MD, MBBS"}
          </div>

          <div style={{ margin: "16px 0", display: "inline-block" }}>
            <span className="badge badge-completed">
              ● Currently Available
            </span>
          </div>

          <div className="doctor-info-list" style={{ textAlign: "left", marginTop: "16px" }}>
            <div className="doctor-info-item">
              <span>Experience:</span>
              <span>{doctor.experienceYears ? `${doctor.experienceYears} Years` : "5+ Years"}</span>
            </div>
            <div className="doctor-info-item">
              <span>Patient Rating:</span>
              <span className="doctor-rating">★ 4.9 / 5.0</span>
            </div>
            <div className="doctor-info-item">
              <span>Consultation Fee:</span>
              <span>₹{doctor.consultationFee != null ? doctor.consultationFee : "500.00"}</span>
            </div>
            <div className="doctor-info-item">
              <span>Hospital Room:</span>
              <span>{doctor.roomNumber ? `Room ${doctor.roomNumber}` : "Room 101"}</span>
            </div>
          </div>

          <Link
            to={`/book/${doctor.id}`}
            className="btn btn-primary btn-block"
            style={{ padding: "12px", marginTop: "16px" }}
          >
            Book Appointment with Dr. {doctor.name}
          </Link>
        </div>

        {/* Right Details and Schedule Card */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3>About Dr. {doctor.name}</h3>
            </div>
            <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.6" }}>
              Dr. {doctor.name} is a highly accomplished {doctor.specialization} specialist at ApexCare Hospital. With over {doctor.experienceYears || 5} years of dedicated clinical practice, Dr. {doctor.name} specializes in comprehensive diagnosis, compassionate patient care, and state-of-the-art treatment methodologies.
            </p>
          </div>

          {/* Weekly Schedules */}
          <div className="card">
            <div className="card-header">
              <h3>Weekly Consultation Schedule</h3>
              <span style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
                {schedules.length} active shift(s)
              </span>
            </div>

            {schedules.length === 0 ? (
              <p style={{ color: "var(--secondary-text)", fontSize: "14px" }}>
                No active consultation schedule published. Please check back soon or consult reception.
              </p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Consultation Hours</th>
                      <th>Max Tokens / Day</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.dayOfWeek}</strong></td>
                        <td>{s.startTime} - {s.endTime}</td>
                        <td>{s.maxTokensPerDay} tokens</td>
                        <td>
                          <span className="badge badge-completed">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;
