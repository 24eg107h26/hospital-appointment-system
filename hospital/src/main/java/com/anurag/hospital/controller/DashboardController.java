package com.anurag.hospital.controller;

import com.anurag.hospital.dto.DashboardStatsDto;
import com.anurag.hospital.entity.Appointment;
import com.anurag.hospital.enums.AppointmentStatus;
import com.anurag.hospital.repository.AppointmentRepository;
import com.anurag.hospital.repository.DepartmentRepository;
import com.anurag.hospital.repository.DoctorRepository;
import com.anurag.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class DashboardController {

      @Autowired
      private PatientRepository patientRepository;

      @Autowired
      private DoctorRepository doctorRepository;

      @Autowired
      private DepartmentRepository departmentRepository;

      @Autowired
      private AppointmentRepository appointmentRepository;

      @GetMapping("/stats")
      @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
      public ResponseEntity<DashboardStatsDto> getDashboardStats() {
            LocalDate today = LocalDate.now();

            DashboardStatsDto stats = new DashboardStatsDto();
            stats.setTotalPatients(patientRepository.count());
            stats.setTotalDoctors(doctorRepository.countByActiveTrue());
            stats.setTotalDepartments(departmentRepository.count());

            stats.setTodayAppointments(appointmentRepository.countByAppointmentDate(today));
            long booked = appointmentRepository.countByAppointmentDateAndStatus(today, AppointmentStatus.BOOKED);
            long waiting = appointmentRepository.countByAppointmentDateAndStatus(today, AppointmentStatus.WAITING);
            stats.setWaitingPatients(booked + waiting);
            stats.setCompletedAppointments(appointmentRepository.countByAppointmentDateAndStatus(today, AppointmentStatus.COMPLETED));
            stats.setCancelledAppointments(appointmentRepository.countByAppointmentDateAndStatus(today, AppointmentStatus.CANCELLED));
            stats.setInProgressAppointments(appointmentRepository.countByAppointmentDateAndStatus(today, AppointmentStatus.IN_PROGRESS));

            List<Appointment> todayApps = appointmentRepository.findByAppointmentDateOrderByDoctorIdAscTokenNumberAsc(today);

            Appointment current = todayApps.stream()
                  .filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS)
                  .findFirst()
                  .orElse(null);

            if (current != null) {
                  stats.setCurrentServingToken(current.getTokenString());
            } else {
                  stats.setCurrentServingToken("None");
            }

            Appointment next = todayApps.stream()
                  .filter(a -> a.getStatus() == AppointmentStatus.WAITING || a.getStatus() == AppointmentStatus.BOOKED)
                  .findFirst()
                  .orElse(null);

            if (next != null) {
                  stats.setNextToken(next.getTokenString());
                  if (next.getPatient() != null && next.getPatient().getUser() != null) {
                        stats.setNextPatientName(next.getPatient().getUser().getName());
                  }
            } else {
                  stats.setNextToken("None");
                  stats.setNextPatientName("None");
            }

            return ResponseEntity.ok(stats);
      }

}
