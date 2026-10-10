import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Dashboard from "./Dashboard.jsx";
import Doctors from "./Doctors.jsx";
import DoctorProfile from "./DoctorProfile.jsx";
import BookAppointment from "./BookAppointment.jsx";
import AppointmentConfirmation from "./AppointmentConfirmation.jsx";
import MyAppointments from "./MyAppointments.jsx";
import TokenStatus from "./TokenStatus.jsx";
import LiveQueue from "./LiveQueue.jsx";
import DoctorQueue from "./DoctorQueue.jsx";
import DoctorCallNext from "./DoctorCallNext.jsx";
import ManageDoctors from "./ManageDoctors.jsx";
import ManagePatients from "./ManagePatients.jsx";
import ManageDepartments from "./ManageDepartments.jsx";
import ManageSchedules from "./ManageSchedules.jsx";
import ManageAppointments from "./ManageAppointments.jsx";
import NotFound from "./NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import "./App.css";

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Doctors Directory & Profile */}
        <Route
          path="/doctors"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "ADMIN", "DOCTOR"]}>
              <Doctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors/:doctorId"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "ADMIN", "DOCTOR"]}>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />

        {/* Patient & Admin Appointment Booking & Status */}
        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:doctorId"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
              <AppointmentConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/token-status"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "ADMIN", "DOCTOR"]}>
              <TokenStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-queue"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "ADMIN", "DOCTOR"]}>
              <LiveQueue />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor-queue"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/call-next"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorCallNext />
            </ProtectedRoute>
          }
        />

        {/* Admin Management Routes */}
        <Route
          path="/manage-patients"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManagePatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-doctors"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageDoctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-departments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageDepartments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-schedules"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageSchedules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-appointments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queue-management"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <LiveQueue />
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
