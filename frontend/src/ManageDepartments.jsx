import React, { useState, useEffect } from "react";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await Api.get("/api/departments?all=true");
      setDepartments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      description: "",
      active: true
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || "",
      description: dept.description || "",
      active: dept.active ?? true
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDept(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Department name is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingDept) {
        await Api.put(`/api/departments/${editingDept.id}`, formData);
        setSuccess("Department updated successfully.");
      } else {
        await Api.post("/api/departments", formData);
        setSuccess("New department added successfully.");
      }
      closeModal();
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete/deactivate department "${dept.name}"?`)) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      await Api.delete(`/api/departments/${dept.id}`);
      setSuccess(`Department "${dept.name}" deleted or deactivated successfully.`);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Failed to delete department.");
    }
  };

  return (
    <Layout title="Department Management">
      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary-dark)", margin: 0 }}>
              Hospital Departments
            </h2>
            <p style={{ color: "var(--secondary-text)", fontSize: "13px", marginTop: "4px", margin: 0 }}>
              Manage medical specialities, assigned doctors, and departmental status
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>➕</span> Add New Department
          </button>
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

        {/* Departments Cards / Table */}
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary-text)" }}>
              Loading departments...
            </div>
          ) : departments.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary-text)" }}>
              No departments found. Click <strong>Add New Department</strong> to create one.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>ID</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>DEPARTMENT NAME</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>DESCRIPTION</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>ASSIGNED DOCTORS</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>STATUS</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "var(--secondary-text)" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--primary-blue)" }}>
                        #{dept.id}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#1E293B" }}>{dept.name}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--secondary-text)", maxWidth: "320px" }}>
                        {dept.description || <span style={{ color: "#94A3B8" }}>No description provided</span>}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span style={{ padding: "4px 10px", backgroundColor: "#F1F5F9", borderRadius: "12px", fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                          {dept.doctorCount || 0} Doctor{dept.doctorCount === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span className={`badge ${dept.active ? "badge-completed" : "badge-cancelled"}`}>
                          {dept.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(dept)}
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
                            onClick={() => handleDelete(dept)}
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

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 1000 }}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", width: "90%" }}>
              <div className="modal-header">
                <h3>{editingDept ? "Edit Department" : "Add New Department"}</h3>
                <button type="button" className="modal-close-btn" onClick={closeModal}>
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                      Department Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Cardiology"
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#334155" }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief overview of medical services provided..."
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <input
                      type="checkbox"
                      id="deptActive"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="deptActive" style={{ fontSize: "14px", fontWeight: 500, color: "#334155", cursor: "pointer" }}>
                      Active department (available for doctor assignments & booking)
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Saving..." : editingDept ? "Update Department" : "Create Department"}
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

export default ManageDepartments;
