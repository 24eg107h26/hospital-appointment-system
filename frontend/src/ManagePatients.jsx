import React, { useState, useEffect } from "react";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    age: "",
    gender: "Male",
    address: ""
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const url = searchTerm ? `/api/patients?search=${encodeURIComponent(searchTerm)}` : "/api/patients";
      const res = await Api.get(url);
      setPatients(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patient records.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchPatients("");
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      age: "",
      gender: "Male",
      address: ""
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      password: "",
      age: patient.age || "",
      gender: patient.gender || "Male",
      address: patient.address || ""
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatient(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Patient name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (formData.age && (isNaN(formData.age) || Number(formData.age) <= 0)) {
      setError("Please enter a valid age.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingPatient) {
        await Api.put(`/api/patients/${editingPatient.id}`, {
          ...formData,
          age: formData.age ? Number(formData.age) : null
        });
        setSuccess("Patient information updated successfully.");
      } else {
        await Api.post("/api/patients", {
          ...formData,
          age: formData.age ? Number(formData.age) : null
        });
        setSuccess("New patient registered successfully.");
      }
      closeModal();
      fetchPatients(search);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Are you sure you want to delete patient "${patient.name}"? This action cannot be undone.`)) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      await Api.delete(`/api/patients/${patient.id}`);
      setSuccess(`Patient "${patient.name}" removed successfully.`);
      fetchPatients(search);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Failed to delete patient record.");
    }
  };

  return (
    <Layout title="Patient Management">
      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
        {/* Header toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary-dark)", margin: 0 }}>
              Hospital Patients Directory
            </h2>
            <p style={{ color: "var(--secondary-text)", fontSize: "13px", marginTop: "4px", margin: 0 }}>
              Manage registered patients, demographic records, and contact details
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>➕</span> Add New Patient
          </button>
        </div>

        {/* Search bar */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: "24px" }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
              <input
                type="text"
                placeholder="Search patient by name or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: "10px 18px" }}>
              🔍 Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClearSearch}
                style={{ padding: "10px 14px" }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div style={{ padding: "12px 16px", backgroundColor: "#FFEBEE", color: "#C62828", borderRadius: "8px", marginBottom: "16px", border: "1px solid #FFCDD2" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "12px 16px", backgroundColor: "#E8F5E9", color: "#2E7D32", borderRadius: "8px", marginBottom: "16px", border: "1px solid #C8E6C9" }}>
            ✓ {success}
          </div>
        )}

        {/* Patients Table */}
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary-text)" }}>
              Loading patient records...
            </div>
          ) : patients.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary-text)" }}>
              No patient records found {search ? `matching "${search}"` : ""}. Click <strong>Add New Patient</strong> to register one.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>ID</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>PATIENT NAME</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>EMAIL</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>PHONE</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>AGE / GENDER</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>ADDRESS</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--primary-blue)" }}>
                        #{p.id}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#1E293B" }}>{p.name}</div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--secondary-text)", fontSize: "13px" }}>
                        {p.email}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px" }}>
                        {p.phone || <span style={{ color: "#94A3B8" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px" }}>
                        {p.age ? `${p.age} yrs` : "—"} / <span style={{ fontWeight: 500 }}>{p.gender || "—"}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--secondary-text)", maxWidth: "200px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {p.address || <span style={{ color: "#94A3B8" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#EFF6FF",
                              color: "#1D4ED8",
                              border: "1px solid #BFDBFE",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#FEF2F2",
                              color: "#DC2626",
                              border: "1px solid #FECACA",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 1000 }}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px", width: "90%" }}>
              <div className="modal-header">
                <h3>{editingPatient ? "Edit Patient Information" : "Register New Patient"}</h3>
                <button type="button" className="modal-close-btn" onClick={closeModal}>
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        disabled={!!editingPatient}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          backgroundColor: editingPatient ? "#F1F5F9" : "#FFF",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 9876543210"
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="e.g. 35"
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", boxSizing: "border-box", backgroundColor: "#FFF" }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                      Address
                    </label>
                    <textarea
                      name="address"
                      rows="2"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. 123 Healthcare Ave, Springfield"
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                  </div>

                  {!editingPatient && (
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                        Initial Password (optional, default: <code>patient123</code>)
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank for default 'patient123'"
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", boxSizing: "border-box" }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Saving..." : editingPatient ? "Update Patient" : "Register Patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManagePatients;
