package com.anurag.hospital.dto;

public class DashboardStatsDto {

      private long totalPatients;
      private long totalDoctors;
      private long totalDepartments;
      private long todayAppointments;
      private long waitingPatients;
      private long completedAppointments;
      private long cancelledAppointments;
      private long inProgressAppointments;
      private String currentServingToken;
      private String nextToken;
      private String nextPatientName;

      public DashboardStatsDto() {
      }

      public long getTotalPatients() {
            return totalPatients;
      }

      public void setTotalPatients(long totalPatients) {
            this.totalPatients = totalPatients;
      }

      public long getTotalDoctors() {
            return totalDoctors;
      }

      public void setTotalDoctors(long totalDoctors) {
            this.totalDoctors = totalDoctors;
      }

      public long getTotalDepartments() {
            return totalDepartments;
      }

      public void setTotalDepartments(long totalDepartments) {
            this.totalDepartments = totalDepartments;
      }

      public long getTodayAppointments() {
            return todayAppointments;
      }

      public void setTodayAppointments(long todayAppointments) {
            this.todayAppointments = todayAppointments;
      }

      public long getWaitingPatients() {
            return waitingPatients;
      }

      public void setWaitingPatients(long waitingPatients) {
            this.waitingPatients = waitingPatients;
      }

      public long getCompletedAppointments() {
            return completedAppointments;
      }

      public void setCompletedAppointments(long completedAppointments) {
            this.completedAppointments = completedAppointments;
      }

      public long getCancelledAppointments() {
            return cancelledAppointments;
      }

      public void setCancelledAppointments(long cancelledAppointments) {
            this.cancelledAppointments = cancelledAppointments;
      }

      public long getInProgressAppointments() {
            return inProgressAppointments;
      }

      public void setInProgressAppointments(long inProgressAppointments) {
            this.inProgressAppointments = inProgressAppointments;
      }

      public String getCurrentServingToken() {
            return currentServingToken;
      }

      public void setCurrentServingToken(String currentServingToken) {
            this.currentServingToken = currentServingToken;
      }

      public String getNextToken() {
            return nextToken;
      }

      public void setNextToken(String nextToken) {
            this.nextToken = nextToken;
      }

      public String getNextPatientName() {
            return nextPatientName;
      }

      public void setNextPatientName(String nextPatientName) {
            this.nextPatientName = nextPatientName;
      }

}
