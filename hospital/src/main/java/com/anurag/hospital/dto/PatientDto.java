package com.anurag.hospital.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class PatientDto {

      private Long id;
      private Long userId;

      @NotBlank(message = "Patient name is required")
      private String name;

      @NotBlank(message = "Email is required")
      @Email(message = "Valid email is required")
      private String email;

      private String phone;
      private String password;
      private Integer age;
      private String gender;
      private String address;
      private LocalDateTime createdAt;

      public PatientDto() {
      }

      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public Long getUserId() {
            return userId;
      }

      public void setUserId(Long userId) {
            this.userId = userId;
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

      public String getPhone() {
            return phone;
      }

      public void setPhone(String phone) {
            this.phone = phone;
      }

      public String getPassword() {
            return password;
      }

      public void setPassword(String password) {
            this.password = password;
      }

      public Integer getAge() {
            return age;
      }

      public void setAge(Integer age) {
            this.age = age;
      }

      public String getGender() {
            return gender;
      }

      public void setGender(String gender) {
            this.gender = gender;
      }

      public String getAddress() {
            return address;
      }

      public void setAddress(String address) {
            this.address = address;
      }

      public LocalDateTime getCreatedAt() {
            return createdAt;
      }

      public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
      }

}
