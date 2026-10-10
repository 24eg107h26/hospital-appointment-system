package com.anurag.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
public class Doctor {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @OneToOne
      @JoinColumn(name = "user_id", nullable = false, unique = true)
      private User user;

      @ManyToOne
      @JoinColumn(name = "department_id")
      private Department department;

      @Column(name = "specialization", nullable = false, length = 100)
      private String specialization;

      @Column(name = "qualification", length = 100)
      private String qualification;

      @Column(name = "experience_years")
      private Integer experienceYears;

      @Column(name = "consultation_fee", precision = 10, scale = 2)
      private BigDecimal consultationFee;

      @Column(name = "room_number", length = 20)
      private String roomNumber;

      @Column(name = "active")
      private Boolean active = true;

      public Doctor() {
      }

      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public User getUser() {
            return user;
      }

      public void setUser(User user) {
            this.user = user;
      }

      public String getSpecialization() {
            return specialization;
      }

      public void setSpecialization(String specialization) {
            this.specialization = specialization;
      }

      public String getQualification() {
            return qualification;
      }

      public void setQualification(String qualification) {
            this.qualification = qualification;
      }

      public Integer getExperienceYears() {
            return experienceYears;
      }

      public void setExperienceYears(Integer experienceYears) {
            this.experienceYears = experienceYears;
      }

      public BigDecimal getConsultationFee() {
            return consultationFee;
      }

      public void setConsultationFee(BigDecimal consultationFee) {
            this.consultationFee = consultationFee;
      }

      public String getRoomNumber() {
            return roomNumber;
      }

      public void setRoomNumber(String roomNumber) {
            this.roomNumber = roomNumber;
      }

      public Boolean getActive() {
            return active;
      }

      public void setActive(Boolean active) {
            this.active = active;
      }

      public Department getDepartment() {
            return department;
      }

      public void setDepartment(Department department) {
            this.department = department;
      }

}
