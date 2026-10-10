package com.anurag.hospital.controller;

import com.anurag.hospital.dto.AppointmentDto;
import com.anurag.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import com.anurag.hospital.enums.AppointmentStatus;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class AppointmentController {

      @Autowired
      private AppointmentService appointmentService;

      @PostMapping
      @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
      public ResponseEntity<AppointmentDto> bookAppointment(@Valid @RequestBody AppointmentDto dto, Authentication authentication) {
            String userEmail = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                  .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            return ResponseEntity.ok(appointmentService.bookAppointment(userEmail, isAdmin, dto));
      }

      @GetMapping("/my")
      @PreAuthorize("hasRole('PATIENT')")
      public ResponseEntity<List<AppointmentDto>> getMyAppointments(Authentication authentication) {
            String patientEmail = authentication.getName();
            return ResponseEntity.ok(appointmentService.getMyAppointments(patientEmail));
      }

      @GetMapping("/{id}")
      @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
      public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable Long id) {
            return ResponseEntity.ok(appointmentService.getAppointmentById(id));
      }

      @PutMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<AppointmentDto> updateAppointment(@PathVariable Long id, @RequestBody AppointmentDto dto) {
            return ResponseEntity.ok(appointmentService.updateAppointment(id, dto));
      }

      @PutMapping("/{id}/status")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<AppointmentDto> updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
            String statusStr = body.get("status");
            AppointmentStatus status = AppointmentStatus.valueOf(statusStr.toUpperCase());
            return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
      }

      @GetMapping("/today")
      @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
      public ResponseEntity<List<AppointmentDto>> getTodayAppointments() {
            return ResponseEntity.ok(appointmentService.getAppointmentsForAdmin(LocalDate.now(), null));
      }

      @DeleteMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<String> deleteAppointment(@PathVariable Long id) {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok("Appointment deleted successfully");
      }

      @GetMapping("/date/{date}")
      @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
      public ResponseEntity<List<AppointmentDto>> getAppointmentsByDate(
                  @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByDate(date));
      }

      @GetMapping("/token/{tokenNumber}")
      @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
      public ResponseEntity<AppointmentDto> getAppointmentByToken(@PathVariable String tokenNumber) {
            return ResponseEntity.ok(appointmentService.getAppointmentByToken(tokenNumber));
      }

      @PutMapping("/{id}/cancel")
      @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
      public ResponseEntity<AppointmentDto> cancelAppointment(@PathVariable Long id, Authentication authentication) {
            String userEmail = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                  .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            return ResponseEntity.ok(appointmentService.cancelAppointment(id, userEmail, isAdmin));
      }

      @GetMapping
      @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
      public ResponseEntity<List<AppointmentDto>> getAppointments(
                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                  @RequestParam(required = false) Long doctorId) {
            if (date != null || doctorId != null) {
                  return ResponseEntity.ok(appointmentService.getAppointmentsForAdmin(date, doctorId));
            }
            return ResponseEntity.ok(appointmentService.getAllAppointments());
      }

      @PutMapping("/{id}/checkin")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<AppointmentDto> checkinAppointment(@PathVariable Long id) {
            return ResponseEntity.ok(appointmentService.checkinAppointment(id));
      }

}
