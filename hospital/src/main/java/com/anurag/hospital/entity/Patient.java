package com.anurag.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "patients")
public class Patient {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @OneToOne
      @JoinColumn(name = "user_id", nullable = false, unique = true)
      private User user;

      @Column(name = "age")
      private Integer age;

      @Column(name = "gender", length = 10)
      private String gender;

      @Column(name = "address", length = 255)
      private String address;

      public Patient() {
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

      @Column(name = "created_at")
      private java.time.LocalDateTime createdAt;

      @jakarta.persistence.PrePersist
      public void prePersist() {
            if (this.createdAt == null) {
                  this.createdAt = java.time.LocalDateTime.now();
            }
      }

      public String getAddress() {
            return address;
      }

      public void setAddress(String address) {
            this.address = address;
      }

      public java.time.LocalDateTime getCreatedAt() {
            return createdAt;
      }

      public void setCreatedAt(java.time.LocalDateTime createdAt) {
            this.createdAt = createdAt;
      }

}
