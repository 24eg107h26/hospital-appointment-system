package com.anurag.hospital.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class RegisterDto {

      private Long id;

      @NotBlank(message = "Name is required")
      private String name;

      @NotBlank(message = "Email is required")
      @Email(message = "Invalid email format")
      private String email;

      @NotBlank(message = "Password is required")
      @Size(min = 6, message = "Password must be at least 6 characters")
      private String password;

      private String phone;

      @Positive(message = "Age must be greater than zero")
      private Integer age;

      private String gender;

      private String address;

      public RegisterDto() {
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

}
