package com.anurag.hospital.repository;

import com.anurag.hospital.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

      // Finds the doctor profile linked to a specific user account ID
      Optional<Doctor> findByUserId(Long userId);

      // Retrieves all doctors who are currently marked active for booking
      List<Doctor> findByActiveTrue();

      long countByActiveTrue();

      List<Doctor> findByDepartmentId(Long departmentId);

      List<Doctor> findByDepartmentIdAndActiveTrue(Long departmentId);

      long countByDepartmentId(Long departmentId);
}
