package com.anurag.hospital.repository;

import com.anurag.hospital.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

      Optional<Patient> findByUserId(Long userId);

      @Query("SELECT p FROM Patient p JOIN p.user u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR u.phone LIKE CONCAT('%', :query, '%')")
      List<Patient> searchPatients(@Param("query") String query);

}
