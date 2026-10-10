package com.anurag.hospital.dto;

public class LoginResposnseDto {

      private String token;
      private String role;
      private String name;
      private Long userId;
      private Long doctorId;
      private Long patientId;

      public LoginResposnseDto() {
      }

      public LoginResposnseDto(String token, String role, String name, Long userId, Long doctorId, Long patientId) {
            this.token = token;
            this.role = role;
            this.name = name;
            this.userId = userId;
            this.doctorId = doctorId;
            this.patientId = patientId;
      }

      public String getToken() {
            return token;
      }

      public void setToken(String token) {
            this.token = token;
      }

      public String getRole() {
            return role;
      }

      public void setRole(String role) {
            this.role = role;
      }

      public String getName() {
            return name;
      }

      public void setName(String name) {
            this.name = name;
      }

      public Long getUserId() {
            return userId;
      }

      public void setUserId(Long userId) {
            this.userId = userId;
      }

      public Long getDoctorId() {
            return doctorId;
      }

      public void setDoctorId(Long doctorId) {
            this.doctorId = doctorId;
      }

      public Long getPatientId() {
            return patientId;
      }

      public void setPatientId(Long patientId) {
            this.patientId = patientId;
      }

}
