package com.anurag.hospital.repository;

import com.anurag.hospital.entity.Appointment;
import com.anurag.hospital.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

      // Retrieves all appointments of a patient ordered from newest date to oldest, then by token number
      List<Appointment> findByPatientIdOrderByAppointmentDateDescTokenNumberAsc(Long patientId);

      // Retrieves all appointments of a doctor on a specific date in token order
      List<Appointment> findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(Long doctorId, LocalDate appointmentDate);

      // Retrieves all hospital appointments for a given date sorted by doctor and token number
      List<Appointment> findByAppointmentDateOrderByDoctorIdAscTokenNumberAsc(LocalDate appointmentDate);

      // Calculates the current highest token assigned to a doctor on a given date (defaults to 0 if none)
      @Query("SELECT COALESCE(MAX(a.tokenNumber), 0) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
      int findMaxTokenNumber(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

      // Counts active appointments for a doctor on a specific date excluding a given status like CANCELLED
      long countByDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, LocalDate appointmentDate, AppointmentStatus status);

      // Checks if a patient already has an active appointment with a specific doctor on the given date
      boolean existsByPatientIdAndDoctorIdAndAppointmentDateAndStatusNot(Long patientId, Long doctorId, LocalDate appointmentDate, AppointmentStatus status);

      // Finds the first appointment matching given statuses ordered by token number (used to locate next patient or in-progress patient)
      Optional<Appointment> findFirstByDoctorIdAndAppointmentDateAndStatusInOrderByTokenNumberAsc(Long doctorId, LocalDate appointmentDate, Collection<AppointmentStatus> statuses);

      long countByPatientId(Long patientId);

      List<Appointment> findByAppointmentDate(LocalDate appointmentDate);

      List<Appointment> findByTokenNumber(int tokenNumber);

      long countByStatus(AppointmentStatus status);

      long countByAppointmentDateAndStatus(LocalDate appointmentDate, AppointmentStatus status);

      long countByAppointmentDate(LocalDate appointmentDate);
}
