package com.anurag.hospital.controller;

import com.anurag.hospital.dto.DepartmentDto;
import com.anurag.hospital.service.DepartmentService;
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
@RequestMapping("/api/departments")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class DepartmentController {

      @Autowired
      private DepartmentService departmentService;

      @GetMapping
      public ResponseEntity<List<DepartmentDto>> getDepartments(@RequestParam(defaultValue = "false") boolean all) {
            return ResponseEntity.ok(departmentService.getAllDepartments(all));
      }

      @GetMapping("/{id}")
      public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable Long id) {
            return ResponseEntity.ok(departmentService.getDepartmentById(id));
      }

      @PostMapping
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentDto dto) {
            return ResponseEntity.ok(departmentService.createDepartment(dto));
      }

      @PutMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<DepartmentDto> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentDto dto) {
            return ResponseEntity.ok(departmentService.updateDepartment(id, dto));
      }

      @DeleteMapping("/{id}")
      @PreAuthorize("hasRole('ADMIN')")
      public ResponseEntity<String> deleteDepartment(@PathVariable Long id) {
            departmentService.deleteDepartment(id);
            return ResponseEntity.ok("Department deleted or deactivated successfully");
      }

}
