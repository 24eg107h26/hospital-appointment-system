import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "./Api.jsx";
import Layout from "./Layout.jsx";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const userRole = localStorage.getItem("role") || "";
  const isAdmin = userRole === "ADMIN";

  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId || "");
  const [doctor, setDoctor] = useState(null);

  // Admin patient selection
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const [schedules, setSchedules] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:00 AM - 10:00 AM");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const defaultTimeSlots = [
    { time: "09:00 AM - 10:00 AM", available: true },
    { time: "10:00 AM - 11:00 AM", available: true },
    { time: "11:00 AM - 12:00 PM", available: true },
    { time: "12:00 PM - 01:00 PM", available: false },
    { time: "02:00 PM - 03:00 PM", available: true },
    { time: "03:00 PM - 04:00 PM", available: true },
    { time: "04:00 PM - 05:00 PM", available: true },
    { time: "05:00 PM - 06:00 PM", available: false }
  ];

  useEffect(() => {
    // Fetch departments
    Api.get("/api/departments")
      .then((res) => setDepartments(res.data || []))
      .catch(() => {});

    // Fetch doctors
    fetchDoctors();

    // If admin, fetch patients
    if (isAdmin) {
      Api.get("/api/patients")
        .then((res) => {
          setPatientsList(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedPatientId(String(res.data[0].id));
          }
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const fetchDoctors = (deptId = "") => {
    const url = deptId ? `/api/doctors/active?departmentId=${deptId}` : "/api/doctors/active";
    Api.get(url)
      .then((res) => {
        const list = res.data || [];
        setDoctorsList(list);
        if (!selectedDoctorId && list.length > 0) {
          setSelectedDoctorId(list[0].id.toString());
        }
      })
      .catch(() => setError("Failed to load active doctors."));
  };

  const handleDepartmentChange = (deptId) => {
    setSelectedDeptId(deptId);
    setSelectedDoctorId("");
    setDoctor(null);
    setSchedules([]);
    fetchDoctors(deptId);
  };

  useEffect(() => {
    const idToFetch = doctorId || selectedDoctorId;
    if (idToFetch) {
      Api.get(`/api/doctors/${idToFetch}`)
        .then((res) => setDoctor(res.data))
        .catch(() => setDoctor(null));

      Api.get(`/api/schedules/doctor/${idToFetch}`)
        .then((res) => {
          const schedList = res.data || [];
          setSchedules(schedList);
          if (!appointmentDate && schedList.length > 0) {
            selectNextDateForDay(schedList[0].dayOfWeek);
          }
        })
        .catch(() => setSchedules([]));
    }
  }, [doctorId, selectedDoctorId]);

  const getDayName = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  };

  const selectedDayName = getDayName(appointmentDate);
  const isDoctorAvailableOnDate = appointmentDate
    ? (schedules.length === 0 || schedules.some((s) => s.dayOfWeek === selectedDayName))
    : true;

  const selectNextDateForDay = (targetDayName) => {
    const daysMap = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6
    };
    const targetIndex = daysMap[targetDayName.toUpperCase()];
    if (targetIndex === undefined) return;

    const now = new Date();
    let diff = targetIndex - now.getDay();
    if (diff < 0) diff += 7;

    const targetDate = new Date();
    targetDate.setDate(now.getDate() + diff);
    const dateStr = targetDate.toISOString().split("T")[0];
    setAppointmentDate(dateStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isAdmin && !selectedPatientId) {
      setError("Please select a patient to book this appointment for.");
      return;
    }

    const targetDocId = doctorId || selectedDoctorId;
    if (!targetDocId) {
      setError("Please select a doctor.");
      return;
    }

    if (!appointmentDate) {
      setError("Please choose an appointment date.");
      return;
    }

    if (schedules.length > 0 && !isDoctorAvailableOnDate) {
      setError(`Dr. ${doctor?.name || "Selected doctor"} is not scheduled on ${selectedDayName}. Please pick one of their available clinic days.`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        doctorId: parseInt(targetDocId, 10),
        appointmentDate,
        appointmentTime: selectedTimeSlot,
        reason: reason || "General Consultation",
        ...(isAdmin && selectedPatientId ? { patientId: parseInt(selectedPatientId, 10) } : {})
      };

      const response = await Api.post("/api/appointments", payload);
      const data = response.data;

      const formattedToken = data.tokenString || (data.tokenNumber ? `T${String(data.tokenNumber).padStart(3, "0")}` : "T001");

      // Navigate to Appointment Confirmation screen
      navigate("/confirmation", {
        state: {
          tokenNumber: formattedToken,
          doctorName: data.doctorName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime || selectedTimeSlot,
          reason: data.reason,
          appointmentId: data.id
        }
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Booking failed. Please check date and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Book Appointment">
      <div style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "40px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>
            Schedule an Appointment
          </h2>
          <p style={{ color: "var(--secondary-text)", fontSize: "14px", marginTop: "2px" }}>
            {isAdmin
              ? "Receptionist / Admin Portal: Book an appointment and generate a live queue token for a patient."
              : "Select your specialist, consultation date, and generate your live queue token."}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* STEP 0 (For Admin): Select Patient */}
          {isAdmin && (
            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-header">
                <h3>Select Patient *</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Patient Record</label>
                <select
                  className="form-select"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  <option value="">-- Choose patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.name} ({p.phone || p.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 1: Department & Doctor */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="card-header">
              <h3>1. Select Doctor & Department</h3>
              {doctor && (
                <span className="badge badge-completed">
                  Dr. {doctor.name} — {doctor.departmentName || doctor.specialization}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div className="form-group">
                <label className="form-label">Department Filter</label>
                <select
                  className="form-select"
                  value={selectedDeptId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doc-select">
                  Medical Specialist *
                </label>
                <select
                  id="doc-select"
                  className="form-select"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  disabled={!!doctorId}
                >
                  <option value="">-- Choose a doctor --</option>
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name} — {d.departmentName || d.specialization} ({d.qualification || "MD"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {doctor && (
              <div style={{ backgroundColor: "#F8FAFC", padding: "16px 20px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "var(--secondary-text)" }}>Department:</span>{" "}
                    <strong>{doctor.departmentName || "General"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--secondary-text)" }}>Specialization:</span>{" "}
                    <strong>{doctor.specialization}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--secondary-text)" }}>Consultation Fee:</span>{" "}
                    <strong>₹{doctor.consultationFee != null ? doctor.consultationFee : "500.00"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--secondary-text)" }}>Clinic Room:</span>{" "}
                    <strong>{doctor.roomNumber ? `Room ${doctor.roomNumber}` : "Room 101"}</strong>
                  </div>
                </div>

                {/* Available Shifts quick selector */}
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary-text)", marginBottom: "8px" }}>
                    Doctor's Weekly Consultation Schedule:
                  </div>
                  {schedules.length > 0 ? (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      {schedules.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`btn btn-sm ${selectedDayName === s.dayOfWeek ? "btn-primary" : "btn-secondary"}`}
                          style={{ fontSize: "12px" }}
                          onClick={() => selectNextDateForDay(s.dayOfWeek)}
                        >
                          📅 {s.dayOfWeek} ({s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)})
                        </button>
                      ))}
                      <span style={{ fontSize: "11px", color: "var(--secondary-text)", marginLeft: "4px" }}>
                        (Click a shift to auto-select next date)
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                      ℹ️ Regular OPD slots open daily. You may select any upcoming date.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Select Date */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="card-header">
              <h3>2. Select Date</h3>
              {appointmentDate && (
                <span className="badge badge-booked">
                  {selectedDayName}, {appointmentDate}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="appt-date">
                Consultation Date *
              </label>
              <input
                id="appt-date"
                type="date"
                min={today}
                className="form-input"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>

            {appointmentDate && schedules.length > 0 && !isDoctorAvailableOnDate && (
              <div style={{ padding: "10px 14px", backgroundColor: "#FFF3E0", color: "#E65100", borderRadius: "6px", fontSize: "13px", marginTop: "10px" }}>
                ⚠️ Notice: Dr. {doctor?.name} is typically not scheduled on {selectedDayName}.
              </div>
            )}
          </div>

          {/* STEP 3: Select Session / Time Slot */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="card-header">
              <h3>3. Preferred Consultation Session</h3>
              <span className="badge badge-progress">{selectedTimeSlot}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "10px" }}>
              {defaultTimeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                    disabled={!slot.available}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid var(--primary-blue)" : "1px solid var(--border-color)",
                      backgroundColor: isSelected ? "#EFF6FF" : slot.available ? "#FFF" : "#F1F5F9",
                      color: isSelected ? "var(--primary-blue)" : slot.available ? "#1E293B" : "#94A3B8",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: slot.available ? "pointer" : "not-allowed",
                      fontSize: "12px",
                      textAlign: "center"
                    }}
                  >
                    <div>{slot.time}</div>
                    <div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.8 }}>
                      {slot.available ? "Available" : "Filled"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Reason for Visit */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h3>4. Symptoms / Reason for Visit</h3>
            </div>
            <div className="form-group">
              <textarea
                className="form-input"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe symptoms, follow-up purpose, or consultation notes..."
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "14px 28px", fontSize: "15px" }}
              disabled={loading || !appointmentDate || (isAdmin && !selectedPatientId)}
            >
              {loading ? "Generating Your Token..." : "✓ Confirm Appointment & Generate Token"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BookAppointment;
