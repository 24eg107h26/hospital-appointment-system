import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctors();
    Api.get("/api/departments")
      .then((res) => setDepartments(res.data || []))
      .catch(() => {});
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await Api.get("/api/doctors/active");
      setDoctors(res.data || []);
    } catch {
      setError("Failed to fetch doctors list.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.departmentName && doc.departmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.qualification && doc.qualification.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept =
      selectedDept === "ALL" ||
      (doc.departmentName && doc.departmentName.toLowerCase() === selectedDept.toLowerCase());

    return matchesSearch && matchesDept;
  });

  return (
    <Layout title="Hospital Specialists">
      {/* Header and Search */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
          Find a Doctor &amp; Book an Appointment
        </h2>
        <p style={{ color: "var(--secondary-text)", fontSize: "14px", marginTop: "2px" }}>
          Select a verified medical specialist or filter by department to generate your consultation token.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search and Filter Row */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search doctor by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary-text)" }}>Department:</span>
            <button
              type="button"
              className={`btn btn-sm ${selectedDept === "ALL" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSelectedDept("ALL")}
            >
              All
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`btn btn-sm ${selectedDept === d.name ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setSelectedDept(d.name)}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          Loading specialists...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--secondary-text)" }}>
            No doctors found matching "{searchTerm}" {selectedDept !== "ALL" ? `in ${selectedDept}` : ""}.
          </p>
        </div>
      ) : (
        <div className="doctor-grid">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="doctor-card">
              <div>
                <div className="doctor-card-top">
                  <div className="doctor-avatar">
                    👨‍⚕️
                  </div>
                  <div className="doctor-details">
                    <h3>Dr. {doc.name}</h3>
                    <div className="doctor-specialty">{doc.specialization}</div>
                    <div style={{ marginTop: "4px" }}>
                      <span style={{ padding: "2px 8px", backgroundColor: "#F0FDF4", color: "#166534", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>
                        {doc.departmentName || "General Medicine"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="doctor-info-list" style={{ marginTop: "14px" }}>
                  <div className="doctor-info-item">
                    <span>Qualification</span>
                    <span>{doc.qualification || "MD, MBBS"}</span>
                  </div>
                  <div className="doctor-info-item">
                    <span>Experience</span>
                    <span>{doc.experienceYears ? `${doc.experienceYears} Years` : "5+ Years"}</span>
                  </div>
                  <div className="doctor-info-item">
                    <span>Consultation Fee</span>
                    <span>₹{doc.consultationFee != null ? doc.consultationFee : "500.00"}</span>
                  </div>
                  <div className="doctor-info-item">
                    <span>Clinic Room</span>
                    <span>{doc.roomNumber ? `Room ${doc.roomNumber}` : "Room 101"}</span>
                  </div>
                  <div className="doctor-info-item">
                    <span>Availability</span>
                    <span className="badge badge-completed" style={{ padding: "2px 8px", fontSize: "11px" }}>
                      ● Available
                    </span>
                  </div>
                </div>
              </div>

              <div className="doctor-card-actions" style={{ marginTop: "16px" }}>
                <Link
                  to={`/doctors/${doc.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  View Profile
                </Link>
                <Link
                  to={`/book/${doc.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Book Token
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Doctors;
