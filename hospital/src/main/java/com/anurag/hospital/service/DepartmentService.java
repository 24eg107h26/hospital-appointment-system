package com.anurag.hospital.service;

import com.anurag.hospital.dto.DepartmentDto;
import com.anurag.hospital.entity.Department;
import com.anurag.hospital.repository.DepartmentRepository;
import com.anurag.hospital.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

      @Autowired
      private DepartmentRepository departmentRepository;

      @Autowired
      private DoctorRepository doctorRepository;

      public List<DepartmentDto> getAllDepartments(boolean all) {
            List<Department> list = all ? departmentRepository.findAll() : departmentRepository.findByActiveTrue();
            return list.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      public DepartmentDto getDepartmentById(Long id) {
            Department dept = departmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Department not found with id " + id));
            return mapToDto(dept);
      }

      @Transactional
      public DepartmentDto createDepartment(DepartmentDto dto) {
            String name = dto.getName() != null ? dto.getName().trim() : "";
            if (name.isEmpty()) {
                  throw new RuntimeException("Department name cannot be blank");
            }
            if (departmentRepository.existsByName(name)) {
                  throw new RuntimeException("Department with name '" + name + "' already exists");
            }

            Department dept = new Department();
            dept.setName(name);
            dept.setDescription(dto.getDescription());
            dept.setActive(dto.getActive() != null ? dto.getActive() : true);
            Department saved = departmentRepository.save(dept);

            return mapToDto(saved);
      }

      @Transactional
      public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
            Department dept = departmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Department not found with id " + id));

            String name = dto.getName() != null ? dto.getName().trim() : "";
            if (!name.isEmpty() && !name.equalsIgnoreCase(dept.getName())) {
                  if (departmentRepository.existsByName(name)) {
                        throw new RuntimeException("Department with name '" + name + "' already exists");
                  }
                  dept.setName(name);
            }

            if (dto.getDescription() != null) {
                  dept.setDescription(dto.getDescription());
            }
            if (dto.getActive() != null) {
                  dept.setActive(dto.getActive());
            }

            Department updated = departmentRepository.save(dept);
            return mapToDto(updated);
      }

      @Transactional
      public void deleteDepartment(Long id) {
            Department dept = departmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Department not found with id " + id));

            long doctorCount = doctorRepository.countByDepartmentId(id);
            if (doctorCount > 0) {
                  // If doctors are assigned, deactivate instead of hard delete to preserve history
                  dept.setActive(false);
                  departmentRepository.save(dept);
            } else {
                  departmentRepository.delete(dept);
            }
      }

      private DepartmentDto mapToDto(Department dept) {
            DepartmentDto dto = new DepartmentDto();
            dto.setId(dept.getId());
            dto.setName(dept.getName());
            dto.setDescription(dept.getDescription());
            dto.setActive(dept.getActive());
            dto.setDoctorCount(doctorRepository.countByDepartmentId(dept.getId()));
            return dto;
      }

}
