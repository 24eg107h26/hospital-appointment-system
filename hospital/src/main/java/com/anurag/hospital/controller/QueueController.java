package com.anurag.hospital.controller;

import com.anurag.hospital.dto.AppointmentDto;
import com.anurag.hospital.dto.TokenStatusDto;
import com.anurag.hospital.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
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

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class QueueController {

      @Autowired
      private QueueService queueService;

      @GetMapping
      public ResponseEntity<List<AppointmentDto>> getQueue(
                  @RequestParam(required = false) Long doctorId,
                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            return ResponseEntity.ok(queueService.getQueue(doctorId, date));
      }

      @GetMapping("/doctor/{doctorId}")
      public ResponseEntity<List<AppointmentDto>> getQueueForDoctor(@PathVariable Long doctorId) {
            return ResponseEntity.ok(queueService.getQueue(doctorId, LocalDate.now()));
      }

      @PostMapping("/call")
      @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
      public ResponseEntity<AppointmentDto> postCallPatient(@RequestBody Map<String, Object> body) {
            if (body.containsKey("appointmentId")) {
                  Long apptId = Long.valueOf(body.get("appointmentId").toString());
                  return ResponseEntity.ok(queueService.callPatientById(apptId));
            }
            if (body.containsKey("doctorId")) {
                  Long docId = Long.valueOf(body.get("doctorId").toString());
                  return ResponseEntity.ok(queueService.callNextForDoctorId(docId));
            }
            throw new RuntimeException("Either appointmentId or doctorId must be provided");
      }

      @PostMapping("/call-next/{doctorId}")
      @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
      public ResponseEntity<AppointmentDto> postCallNextDoctor(@PathVariable Long doctorId) {
            return ResponseEntity.ok(queueService.callNextForDoctorId(doctorId));
      }

      @PostMapping("/complete")
      @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
      public ResponseEntity<AppointmentDto> postCompletePatient(@RequestBody Map<String, Object> body) {
            if (body.containsKey("appointmentId")) {
                  Long apptId = Long.valueOf(body.get("appointmentId").toString());
                  return ResponseEntity.ok(queueService.completeAppointmentById(apptId));
            }
            if (body.containsKey("doctorId")) {
                  Long docId = Long.valueOf(body.get("doctorId").toString());
                  return ResponseEntity.ok(queueService.completeCurrentForDoctorId(docId));
            }
            throw new RuntimeException("Either appointmentId or doctorId must be provided");
      }

      @PostMapping("/complete/{doctorId}")
      @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
      public ResponseEntity<AppointmentDto> postCompleteDoctor(@PathVariable Long doctorId) {
            return ResponseEntity.ok(queueService.completeCurrentForDoctorId(doctorId));
      }

      @GetMapping("/current")
      public ResponseEntity<AppointmentDto> getCurrentServing(
                  @RequestParam(required = false) Long doctorId,
                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            return ResponseEntity.ok(queueService.getCurrentServing(doctorId, date));
      }

      @PutMapping("/{id}/call")
      @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
      public ResponseEntity<AppointmentDto> callPatient(@PathVariable Long id) {
            return ResponseEntity.ok(queueService.callPatientById(id));
      }

      @PutMapping("/{id}/complete")
      @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
      public ResponseEntity<AppointmentDto> completeQueuePatient(@PathVariable Long id) {
            return ResponseEntity.ok(queueService.completeAppointmentById(id));
      }

      @GetMapping("/doctor/today")
      @PreAuthorize("hasRole('DOCTOR')")
      public ResponseEntity<List<AppointmentDto>> getTodayDoctorQueue(Authentication authentication) {
            String doctorEmail = authentication.getName();
            return ResponseEntity.ok(queueService.getTodayAppointmentsForDoctor(doctorEmail));
      }

      @PutMapping("/doctor/call-next")
      @PreAuthorize("hasRole('DOCTOR')")
      public ResponseEntity<AppointmentDto> callNextPatient(Authentication authentication) {
            String doctorEmail = authentication.getName();
            return ResponseEntity.ok(queueService.callNextPatient(doctorEmail));
      }

      @PutMapping("/doctor/{appointmentId}/complete")
      @PreAuthorize("hasRole('DOCTOR')")
      public ResponseEntity<AppointmentDto> completeAppointment(@PathVariable Long appointmentId, Authentication authentication) {
            String doctorEmail = authentication.getName();
            return ResponseEntity.ok(queueService.completeAppointment(appointmentId, doctorEmail));
      }

      @GetMapping("/status/{appointmentId}")
      @PreAuthorize("hasRole('PATIENT')")
      public ResponseEntity<TokenStatusDto> getPatientTokenStatus(@PathVariable Long appointmentId, Authentication authentication) {
            String patientEmail = authentication.getName();
            return ResponseEntity.ok(queueService.getTokenStatus(appointmentId, patientEmail));
      }

      @GetMapping("/admin")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<List<Map<String, Object>>> getAdminQueueOverview(
                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                  @RequestParam(required = false) Long doctorId) {
            return ResponseEntity.ok(queueService.getAdminQueueOverview(date, doctorId));
      }

}
