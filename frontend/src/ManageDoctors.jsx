import React, { useState, useEffect } from "react";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    departmentId: "",
    qualification: "",
    experienceYears: "",
    consultationFee: "",
    roomNumber: "",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await Api.get("/api/departments?all=true");
      setDepartments(res.data || []);
    } catch {
      // departments fallback
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await Api.get("/api/doctors?all=true");
      setDoctors(response.data || []);
    } catch (err) {
      setError("Failed to load doctors list.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setFormData({
      name: doctor.name || "",
      email: doctor.email || "",
      password: "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      departmentId: doctor.departmentId || "",
      qualification: doctor.qualification || "",
      experienceYears: doctor.experienceYears || "",
      consultationFee: doctor.consultationFee || "",
      roomNumber: doctor.roomNumber || "",
      active: doctor.active ?? true,
    });
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      specialization: "",
      departmentId: "",
      qualification: "",
      experienceYears: "",
      consultationFee: "",
      roomNumber: "",
      active: true,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const payload = {
      ...formData,
      departmentId: formData.departmentId ? Number(formData.departmentId) : null,
      experienceYears: formData.experienceYears ? Number(formData.experienceYears) : null,
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : null,
    };

    try {
      if (editingId) {
        await Api.put(`/api/doctors/${editingId}`, payload);
        setMessage("Doctor profile updated successfully.");
      } else {
        await Api.post("/api/doctors", payload);
        setMessage("New doctor registered successfully.");
      }
      handleCancelEdit();
      fetchDoctors();
    } catch (err) {
      const errMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.response && typeof err.response.data === "string"
          ? err.response.data
          : "Failed to save doctor.";
      setError(errMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this doctor?")) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await Api.delete(`/api/doctors/${id}`);
      setMessage("Doctor deactivated successfully.");
      fetchDoctors();
    } catch (err) {
      setError("Failed to deactivate doctor.");
    }
  };

  // Filtered doctors list
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.departmentName && doc.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept =
      !selectedDeptFilter || String(doc.departmentId) === String(selectedDeptFilter);

    return matchesSearch && matchesDept;
  });

  return (
    <Layout title="Manage Doctors">
      <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "40px" }}>
        {/* Form Card */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>{editingId ? "Edit Doctor Profile" : "Register New Medical Specialist"}</h3>
            {editingId && (
              <span className="badge badge-progress">Editing ID #{editingId}</span>
            )}
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Doctor Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Sarah Jenkins"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  name="departmentId"
                  className="form-input"
                  value={formData.departmentId}
                  onChange={handleChange}
                  style={{ backgroundColor: "#FFF" }}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialization / Sub-specialty *</label>
                <input
                  type="text"
                  name="specialization"
                  className="form-input"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology, Orthopedic Surgery"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address {editingId ? "(Cannot change)" : "*"}</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  required
                  disabled={editingId !== null}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password {editingId ? "(Leave empty to keep current)" : "*"}</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  required={!editingId}
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={editingId ? "Leave blank to keep password" : "Min 6 characters"}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Contact number"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  className="form-input"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Experience (Years)</label>
                <input
                  type="number"
                  name="experienceYears"
                  min="0"
                  className="form-input"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  placeholder="e.g. 8"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input
                  type="number"
                  name="consultationFee"
                  min="0"
                  className="form-input"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Clinic Room / OPD</label>
                <input
                  type="text"
                  name="roomNumber"
                  className="form-input"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g. 102-B"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 0" }}>
              <input
                type="checkbox"
                id="doctorActive"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="doctorActive" style={{ fontSize: "14px", fontWeight: 500, color: "#334155", cursor: "pointer" }}>
                Active & Available for Appointments
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving Specialist..." : editingId ? "✓ Update Doctor Profile" : "+ Create Doctor"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Directory Card */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
            <h3>Registered Specialists Directory</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={fetchDoctors}>
              🔄 Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: "flex", gap: "12px", margin: "16px 0", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: "220px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                fontSize: "13px"
              }}
            />

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                fontSize: "13px",
                backgroundColor: "#FFF"
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {(searchTerm || selectedDeptFilter) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDeptFilter("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
              Loading doctors directory...
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
              No doctors found matching the current filters.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Specialization</th>
                    <th>Email</th>
                    <th>Room</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <strong>{doc.name}</strong>
                        <div style={{ fontSize: "12px", color: "var(--secondary-text)" }}>
                          {doc.qualification || "Specialist"}
                        </div>
                      </td>
                      <td>
                        <span style={{ padding: "4px 8px", backgroundColor: "#F0FDF4", color: "#166534", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                          {doc.departmentName || "General"}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "var(--primary-blue)", fontWeight: 500 }}>
                          {doc.specialization}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px" }}>{doc.email}</td>
                      <td>{doc.roomNumber ? `Room ${doc.roomNumber}` : "—"}</td>
                      <td>
                        <strong>₹{doc.consultationFee != null ? doc.consultationFee : "—"}</strong>
                      </td>
                      <td>
                        {doc.active ? (
                          <span className="badge badge-completed">● Active</span>
                        ) : (
                          <span className="badge badge-cancelled">Inactive</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(doc)}
                          >
                            Edit
                          </button>
                          {doc.active && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeactivate(doc.id)}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManageDoctors;
