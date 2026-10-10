import React, { useState, useEffect } from "react";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const ManageSchedules = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    dayOfWeek: "MONDAY",
    startTime: "09:00:00",
    endTime: "13:00:00",
    maxTokensPerDay: 20,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  useEffect(() => {
    Api.get("/api/doctors?all=true")
      .then((res) => {
        setDoctors(res.data);
        if (res.data.length > 0) {
          setSelectedDoctorId(res.data[0].id.toString());
        }
      })
      .catch(() => setError("Failed to load doctors list."));
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchSchedules(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const fetchSchedules = async (doctorId) => {
    setLoading(true);
    setError("");
    try {
      const response = await Api.get(`/api/schedules/doctor/${doctorId}`);
      setSchedules(response.data || []);
    } catch (err) {
      setError("Failed to load doctor schedules.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setFormData({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxTokensPerDay: schedule.maxTokensPerDay,
    });
    setError("");
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      dayOfWeek: "MONDAY",
      startTime: "09:00:00",
      endTime: "13:00:00",
      maxTokensPerDay: 20,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError("Please select a doctor first.");
      return;
    }

    setError("");
    setMessage("");

    const payload = {
      doctorId: parseInt(selectedDoctorId, 10),
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      maxTokensPerDay: parseInt(formData.maxTokensPerDay, 10),
    };

    try {
      if (editingId) {
        await Api.put(`/api/schedules/${editingId}`, payload);
        setMessage("Schedule updated successfully.");
      } else {
        await Api.post("/api/schedules", payload);
        setMessage("Schedule added successfully.");
      }
      handleCancelEdit();
      fetchSchedules(selectedDoctorId);
    } catch (err) {
      const errMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to save schedule. Check that end time is after start time and day is not duplicate.";
      setError(errMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await Api.delete(`/api/schedules/${id}`);
      setMessage("Schedule removed successfully.");
      fetchSchedules(selectedDoctorId);
    } catch (err) {
      setError("Failed to delete schedule.");
    }
  };

  const selectedDoctor = doctors.find((d) => d.id.toString() === selectedDoctorId);

  return (
    <Layout title="Manage Schedules">
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Doctor Selector Card */}
        <div className="card">
          <div className="card-header">
            <h3>Select Medical Specialist</h3>
            {selectedDoctor && (
              <span className="badge badge-progress">
                {selectedDoctor.specialization}
              </span>
            )}
          </div>

          <div className="form-group" style={{ maxWidth: "450px", marginBottom: 0 }}>
            <label className="form-label" htmlFor="doc-select-sched">Doctor</label>
            <select
              id="doc-select-sched"
              className="form-select"
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                handleCancelEdit();
              }}
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.name} — {doc.specialization} {doc.active ? "" : "[Inactive]"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedDoctorId && (
          <>
            {/* Add / Edit Schedule Card */}
            <div className="card">
              <div className="card-header">
                <h3>{editingId ? "Edit Schedule Shift" : "Add Weekly Working Shift"}</h3>
                {editingId && (
                  <span className="badge badge-booked">Editing Entry</span>
                )}
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Day of Week *</label>
                    <select
                      name="dayOfWeek"
                      className="form-select"
                      value={formData.dayOfWeek}
                      onChange={handleChange}
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shift Start Time *</label>
                    <input
                      type="time"
                      step="1"
                      name="startTime"
                      className="form-input"
                      required
                      value={formData.startTime}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shift End Time *</label>
                    <input
                      type="time"
                      step="1"
                      name="endTime"
                      className="form-input"
                      required
                      value={formData.endTime}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Daily Token Limit *</label>
                    <input
                      type="number"
                      name="maxTokensPerDay"
                      className="form-input"
                      min="1"
                      required
                      value={formData.maxTokensPerDay}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? "✓ Update Schedule" : "+ Add Working Day"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Current Schedule Table Card */}
            <div className="card">
              <div className="card-header">
                <h3>
                  Active Weekly Schedule {selectedDoctor ? `for Dr. ${selectedDoctor.name}` : ""}
                </h3>
                <span style={{ fontSize: "13px", color: "var(--secondary-text)" }}>
                  {schedules.length} working day{schedules.length === 1 ? "" : "s"}
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
                  Loading schedules...
                </div>
              ) : schedules.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--secondary-text)" }}>
                  No consultation shifts configured for this specialist yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Day of Week</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Max Tokens</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((sch) => (
                        <tr key={sch.id}>
                          <td>
                            <strong>{sch.dayOfWeek}</strong>
                          </td>
                          <td>{sch.startTime}</td>
                          <td>{sch.endTime}</td>
                          <td>
                            <span className="badge badge-progress">
                              {sch.maxTokensPerDay} Tokens
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEdit(sch)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(sch.id)}
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default ManageSchedules;
