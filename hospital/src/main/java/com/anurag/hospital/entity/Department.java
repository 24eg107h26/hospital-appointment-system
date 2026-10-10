package com.anurag.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "departments")
public class Department {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(name = "name", nullable = false, unique = true, length = 100)
      private String name;

      @Column(name = "description", length = 255)
      private String description;

      @Column(name = "active", nullable = false)
      private Boolean active = true;

      public Department() {
      }

      public Department(Long id, String name, String description, Boolean active) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.active = active != null ? active : true;
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

      public String getDescription() {
            return description;
      }

      public void setDescription(String description) {
            this.description = description;
      }

      public Boolean getActive() {
            return active;
      }

      public void setActive(Boolean active) {
            this.active = active;
      }

}
