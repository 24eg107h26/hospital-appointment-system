package com.anurag.hospital.controller;

import com.anurag.hospital.dto.ScheduleDto;
import com.anurag.hospital.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class ScheduleController {

      @Autowired
      private ScheduleService scheduleService;

      @GetMapping("/doctor/{doctorId}")
      public ResponseEntity<List<ScheduleDto>> getSchedulesByDoctorId(@PathVariable Long doctorId) {
            return ResponseEntity.ok(scheduleService.getSchedulesByDoctorId(doctorId));
      }

      @GetMapping
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<List<ScheduleDto>> getAllSchedules() {
            return ResponseEntity.ok(scheduleService.getAllSchedules());
      }

      @PostMapping
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<ScheduleDto> createSchedule(@Valid @RequestBody ScheduleDto dto) {
            return ResponseEntity.ok(scheduleService.createSchedule(dto));
      }

      @PutMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<ScheduleDto> updateSchedule(@PathVariable Long id, @Valid @RequestBody ScheduleDto dto) {
            return ResponseEntity.ok(scheduleService.updateSchedule(id, dto));
      }

      @DeleteMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<String> deleteSchedule(@PathVariable Long id) {
            scheduleService.deleteSchedule(id);
            return ResponseEntity.ok("Schedule deleted successfully");
      }

}
