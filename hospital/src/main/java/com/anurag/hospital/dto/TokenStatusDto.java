package com.anurag.hospital.dto;

import com.anurag.hospital.enums.AppointmentStatus;
import java.time.LocalDate;

public class TokenStatusDto {

      private String doctorName;
      private LocalDate appointmentDate;
      private int myToken;
      private int currentToken;
      private int patientsAhead;
      private AppointmentStatus status;
      private String message;

      public TokenStatusDto() {
      }

      public TokenStatusDto(String doctorName, LocalDate appointmentDate, int myToken, int currentToken, int patientsAhead, AppointmentStatus status, String message) {
            this.doctorName = doctorName;
            this.appointmentDate = appointmentDate;
            this.myToken = myToken;
            this.currentToken = currentToken;
            this.patientsAhead = patientsAhead;
            this.status = status;
            this.message = message;
      }

      public String getDoctorName() {
            return doctorName;
      }

      public void setDoctorName(String doctorName) {
            this.doctorName = doctorName;
      }

      public LocalDate getAppointmentDate() {
            return appointmentDate;
      }

      public void setAppointmentDate(LocalDate appointmentDate) {
            this.appointmentDate = appointmentDate;
      }

      public int getMyToken() {
            return myToken;
      }

      public void setMyToken(int myToken) {
            this.myToken = myToken;
      }

      public int getCurrentToken() {
            return currentToken;
      }

      public void setCurrentToken(int currentToken) {
            this.currentToken = currentToken;
      }

      public int getPatientsAhead() {
            return patientsAhead;
      }

      public void setPatientsAhead(int patientsAhead) {
            this.patientsAhead = patientsAhead;
      }

      public AppointmentStatus getStatus() {
            return status;
      }

      public void setStatus(AppointmentStatus status) {
            this.status = status;
      }

      public String getMessage() {
            return message;
      }

      public void setMessage(String message) {
            this.message = message;
      }

}
