package com.anurag.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "schedules", uniqueConstraints = {
      @UniqueConstraint(columnNames = {"doctor_id", "day_of_week"})
})
public class Schedule {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne
      @JoinColumn(name = "doctor_id", nullable = false)
      private Doctor doctor;

      @Enumerated(EnumType.STRING)
      @Column(name = "day_of_week", nullable = false)
      private DayOfWeek dayOfWeek;

      @Column(name = "start_time", nullable = false)
      private LocalTime startTime;

      @Column(name = "end_time", nullable = false)
      private LocalTime endTime;

      @Column(name = "max_tokens_per_day", nullable = false)
      private int maxTokensPerDay;

      public Schedule() {
      }

      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public Doctor getDoctor() {
            return doctor;
      }

      public void setDoctor(Doctor doctor) {
            this.doctor = doctor;
      }

      public DayOfWeek getDayOfWeek() {
            return dayOfWeek;
      }

      public void setDayOfWeek(DayOfWeek dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
      }

      public LocalTime getStartTime() {
            return startTime;
      }

      public void setStartTime(LocalTime startTime) {
            this.startTime = startTime;
      }

      public LocalTime getEndTime() {
            return endTime;
      }

      public void setEndTime(LocalTime endTime) {
            this.endTime = endTime;
      }

      public int getMaxTokensPerDay() {
            return maxTokensPerDay;
      }

      public void setMaxTokensPerDay(int maxTokensPerDay) {
            this.maxTokensPerDay = maxTokensPerDay;
      }

}
