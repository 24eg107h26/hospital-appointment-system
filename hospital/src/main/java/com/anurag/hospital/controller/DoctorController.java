package com.anurag.hospital.controller;

import com.anurag.hospital.dto.DoctorDto;
import com.anurag.hospital.service.DoctorService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class DoctorController {

      @Autowired
      private DoctorService doctorService;

      @GetMapping
      public ResponseEntity<List<DoctorDto>> getDoctors(
                  @RequestParam(required = false) Long departmentId,
                  @RequestParam(defaultValue = "false") boolean all) {
            return ResponseEntity.ok(doctorService.getAllDoctors(departmentId, all));
      }

      @GetMapping("/active")
      public ResponseEntity<List<DoctorDto>> getActiveDoctors(
                  @RequestParam(required = false) Long departmentId) {
            return ResponseEntity.ok(doctorService.getAllDoctors(departmentId, false));
      }

      @GetMapping("/department/{deptId}")
      public ResponseEntity<List<DoctorDto>> getDoctorsByDepartment(@PathVariable Long deptId) {
            return ResponseEntity.ok(doctorService.getAllDoctors(deptId, false));
      }

      @GetMapping("/all")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<List<DoctorDto>> getAllDoctorsForAdmin() {
            return ResponseEntity.ok(doctorService.getAllDoctors(null, true));
      }

      @GetMapping("/{id}")
      public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) {
            return ResponseEntity.ok(doctorService.getDoctorById(id));
      }

      @PostMapping
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<DoctorDto> createDoctor(@Valid @RequestBody DoctorDto dto) {
            return ResponseEntity.ok(doctorService.createDoctor(dto));
      }

      @PutMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<DoctorDto> updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorDto dto) {
            return ResponseEntity.ok(doctorService.updateDoctor(id, dto));
      }

      @DeleteMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {
            doctorService.deleteDoctor(id);
            return ResponseEntity.ok("Doctor deactivated successfully");
      }

}
