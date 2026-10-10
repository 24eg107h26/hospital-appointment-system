package com.anurag.hospital.entity;

import com.anurag.hospital.enums.AppointmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments", uniqueConstraints = {
      @UniqueConstraint(columnNames = {"doctor_id", "appointment_date", "token_number"})
})
public class Appointment {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne
      @JoinColumn(name = "patient_id", nullable = false)
      private Patient patient;

      @ManyToOne
      @JoinColumn(name = "doctor_id", nullable = false)
      private Doctor doctor;

      @Column(name = "appointment_date", nullable = false)
      private LocalDate appointmentDate;

      @Column(name = "token_number", nullable = false)
      private int tokenNumber;

      @Column(name = "appointment_time", length = 50)
      private String appointmentTime;

      @Enumerated(EnumType.STRING)
      @Column(name = "status", nullable = false)
      private AppointmentStatus status = AppointmentStatus.BOOKED;

      @Column(name = "reason", length = 255)
      private String reason;

      @Column(name = "created_at", nullable = false)
      private LocalDateTime createdAt;

      @PrePersist
      public void prePersist() {
            if (this.createdAt == null) {
                  this.createdAt = LocalDateTime.now();
            }
            if (this.status == null) {
                  this.status = AppointmentStatus.BOOKED;
            }
      }

      public Appointment() {
      }

      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public Patient getPatient() {
            return patient;
      }

      public void setPatient(Patient patient) {
            this.patient = patient;
      }

      public Doctor getDoctor() {
            return doctor;
      }

      public void setDoctor(Doctor doctor) {
            this.doctor = doctor;
      }

      public LocalDate getAppointmentDate() {
            return appointmentDate;
      }

      public void setAppointmentDate(LocalDate appointmentDate) {
            this.appointmentDate = appointmentDate;
      }

      public int getTokenNumber() {
            return tokenNumber;
      }

      public void setTokenNumber(int tokenNumber) {
            this.tokenNumber = tokenNumber;
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

      public String getAppointmentTime() {
            return appointmentTime;
      }

      public void setAppointmentTime(String appointmentTime) {
            this.appointmentTime = appointmentTime;
      }

      public String getTokenString() {
            return String.format("T%03d", tokenNumber);
      }

}
