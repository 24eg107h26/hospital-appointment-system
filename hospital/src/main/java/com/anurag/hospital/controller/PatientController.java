package com.anurag.hospital.controller;

import com.anurag.hospital.dto.PatientDto;
import com.anurag.hospital.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class PatientController {

      @Autowired
      private PatientService patientService;

      @GetMapping("/me")
      @PreAuthorize("hasRole('PATIENT')")
      public ResponseEntity<PatientDto> getMyProfile(Authentication authentication) {
            String email = authentication.getName();
            return ResponseEntity.ok(patientService.getPatientProfile(email));
      }

      @GetMapping
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<List<PatientDto>> getAllPatients(@RequestParam(required = false) String search) {
            return ResponseEntity.ok(patientService.getAllPatients(search));
      }

      @GetMapping("/{id}")
      @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
      public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
            return ResponseEntity.ok(patientService.getPatientById(id));
      }

      @PostMapping
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<PatientDto> createPatient(@Valid @RequestBody PatientDto dto) {
            return ResponseEntity.ok(patientService.createPatient(dto));
      }

      @PutMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<PatientDto> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientDto dto) {
            return ResponseEntity.ok(patientService.updatePatient(id, dto));
      }

      @DeleteMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<String> deletePatient(@PathVariable Long id) {
            patientService.deletePatient(id);
            return ResponseEntity.ok("Patient deleted successfully");
      }

}
