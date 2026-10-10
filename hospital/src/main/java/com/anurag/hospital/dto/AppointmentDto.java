package com.anurag.hospital.dto;

import com.anurag.hospital.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AppointmentDto {

      private Long id;

      @NotNull(message = "Doctor ID is required")
      private Long doctorId;

      private String doctorName;
      private String specialization;
      private String departmentName;

      private Long patientId;
      private String patientName;
      private String patientPhone;

      @NotNull(message = "Appointment date is required")
      private LocalDate appointmentDate;

      private String appointmentTime;
      private Integer tokenNumber;
      private String tokenString;
      private AppointmentStatus status;
      private String reason;
      private LocalDateTime createdAt;

      public AppointmentDto() {
      }

      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public Long getDoctorId() {
            return doctorId;
      }

      public void setDoctorId(Long doctorId) {
            this.doctorId = doctorId;
      }

      public String getDoctorName() {
            return doctorName;
      }

      public void setDoctorName(String doctorName) {
            this.doctorName = doctorName;
      }

      public String getSpecialization() {
            return specialization;
      }

      public void setSpecialization(String specialization) {
            this.specialization = specialization;
      }

      public String getDepartmentName() {
            return departmentName;
      }

      public void setDepartmentName(String departmentName) {
            this.departmentName = departmentName;
      }

      public Long getPatientId() {
            return patientId;
      }

      public void setPatientId(Long patientId) {
            this.patientId = patientId;
      }

      public String getPatientName() {
            return patientName;
      }

      public void setPatientName(String patientName) {
            this.patientName = patientName;
      }

      public String getPatientPhone() {
            return patientPhone;
      }

      public void setPatientPhone(String patientPhone) {
            this.patientPhone = patientPhone;
      }

      public LocalDate getAppointmentDate() {
            return appointmentDate;
      }

      public void setAppointmentDate(LocalDate appointmentDate) {
            this.appointmentDate = appointmentDate;
      }

      public String getAppointmentTime() {
            return appointmentTime;
      }

      public void setAppointmentTime(String appointmentTime) {
            this.appointmentTime = appointmentTime;
      }

      public Integer getTokenNumber() {
            return tokenNumber;
      }

      public void setTokenNumber(Integer tokenNumber) {
            this.tokenNumber = tokenNumber;
            if (tokenNumber != null) {
                  this.tokenString = String.format("T%03d", tokenNumber);
            }
      }

      public String getTokenString() {
            if (tokenString == null && tokenNumber != null) {
                  return String.format("T%03d", tokenNumber);
            }
            return tokenString;
      }

      public void setTokenString(String tokenString) {
            this.tokenString = tokenString;
      }

      public AppointmentStatus getStatus() {
            return status;
      }

      public void setStatus(AppointmentStatus status) {
            this.status = status;
      }

      public String getReason() {
            return reason;
      }

      public void setReason(String reason) {
            this.reason = reason;
      }

      public LocalDateTime getCreatedAt() {
            return createdAt;
      }

      public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
      }

}
