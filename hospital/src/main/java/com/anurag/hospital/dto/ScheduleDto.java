package com.anurag.hospital.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.DayOfWeek;
import java.time.LocalTime;

public class ScheduleDto {

      private Long id;

      @NotNull(message = "Doctor ID is required")
      private Long doctorId;

      private String doctorName;

      @NotNull(message = "Day of week is required")
      private DayOfWeek dayOfWeek;

      private LocalTime startTime;
      private LocalTime endTime;

      @Positive(message = "Max tokens per day must be positive")
      private int maxTokensPerDay;

      public ScheduleDto() {
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
