package com.anurag.hospital.repository;

import com.anurag.hospital.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

      // Finds all weekly working schedules configured for a specific doctor
      List<Schedule> findByDoctorId(Long doctorId);

      // Finds a doctor's schedule for a particular day of the week
      Optional<Schedule> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);

}
