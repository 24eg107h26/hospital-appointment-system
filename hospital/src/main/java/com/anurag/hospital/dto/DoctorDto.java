package com.anurag.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class DoctorDto {

      private Long id;
      private String name;
      private String email;
      private String password;
      private String phone;

      @NotBlank(message = "Specialization is required")
      private String specialization;

      private Long departmentId;
      private String departmentName;

      private String qualification;
      private Integer experienceYears;
      private BigDecimal consultationFee;
      private String roomNumber;
      private Boolean active;

      public DoctorDto() {
      }

      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public String getName() {
            return name;
      }

      public void setName(String name) {
            this.name = name;
      }

      public String getEmail() {
            return email;
      }

      public void setEmail(String email) {
            this.email = email;
      }

      public String getPassword() {
            return password;
      }

      public void setPassword(String password) {
            this.password = password;
      }

      public String getPhone() {
            return phone;
      }

      public void setPhone(String phone) {
            this.phone = phone;
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

      public Long getDepartmentId() {
            return departmentId;
      }

      public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
      }

      public String getDepartmentName() {
            return departmentName;
      }

      public void setDepartmentName(String departmentName) {
            this.departmentName = departmentName;
      }

}
