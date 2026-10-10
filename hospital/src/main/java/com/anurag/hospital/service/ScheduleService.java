package com.anurag.hospital.service;

import com.anurag.hospital.dto.ScheduleDto;
import com.anurag.hospital.entity.Doctor;
import com.anurag.hospital.entity.Schedule;
import com.anurag.hospital.repository.DoctorRepository;
import com.anurag.hospital.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

      @Autowired
      private ScheduleRepository scheduleRepository;

      @Autowired
      private DoctorRepository doctorRepository;

      public List<ScheduleDto> getSchedulesByDoctorId(Long doctorId) {
            List<Schedule> schedules = scheduleRepository.findByDoctorId(doctorId);
            return schedules.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      public List<ScheduleDto> getAllSchedules() {
            List<Schedule> schedules = scheduleRepository.findAll();
            return schedules.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      @Transactional
      public ScheduleDto createSchedule(ScheduleDto dto) {
            Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                  .orElseThrow(() -> new RuntimeException("Doctor not found with id " + dto.getDoctorId()));

            if (dto.getStartTime() == null || dto.getEndTime() == null || !dto.getEndTime().isAfter(dto.getStartTime())) {
                  throw new RuntimeException("End time must be after start time");
            }

            if (scheduleRepository.findByDoctorIdAndDayOfWeek(doctor.getId(), dto.getDayOfWeek()).isPresent()) {
                  throw new RuntimeException("Schedule already exists for doctor on " + dto.getDayOfWeek());
            }

            Schedule schedule = new Schedule();
            schedule.setDoctor(doctor);
            schedule.setDayOfWeek(dto.getDayOfWeek());
            schedule.setStartTime(dto.getStartTime());
            schedule.setEndTime(dto.getEndTime());
            schedule.setMaxTokensPerDay(dto.getMaxTokensPerDay());
            Schedule savedSchedule = scheduleRepository.save(schedule);

            return mapToDto(savedSchedule);
      }

      @Transactional
      public ScheduleDto updateSchedule(Long id, ScheduleDto dto) {
            Schedule schedule = scheduleRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Schedule not found with id " + id));

            if (dto.getStartTime() != null && dto.getEndTime() != null && !dto.getEndTime().isAfter(dto.getStartTime())) {
                  throw new RuntimeException("End time must be after start time");
            }

            if (dto.getDayOfWeek() != null && !dto.getDayOfWeek().equals(schedule.getDayOfWeek())) {
                  if (scheduleRepository.findByDoctorIdAndDayOfWeek(schedule.getDoctor().getId(), dto.getDayOfWeek()).isPresent()) {
                        throw new RuntimeException("Schedule already exists for doctor on " + dto.getDayOfWeek());
                  }
                  schedule.setDayOfWeek(dto.getDayOfWeek());
            }

            if (dto.getStartTime() != null) {
                  schedule.setStartTime(dto.getStartTime());
            }
            if (dto.getEndTime() != null) {
                  schedule.setEndTime(dto.getEndTime());
            }
            if (dto.getMaxTokensPerDay() > 0) {
                  schedule.setMaxTokensPerDay(dto.getMaxTokensPerDay());
            }

            Schedule updatedSchedule = scheduleRepository.save(schedule);
            return mapToDto(updatedSchedule);
      }

      @Transactional
      public void deleteSchedule(Long id) {
            Schedule schedule = scheduleRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Schedule not found with id " + id));
            scheduleRepository.delete(schedule);
      }

      private ScheduleDto mapToDto(Schedule schedule) {
            ScheduleDto dto = new ScheduleDto();
            dto.setId(schedule.getId());
            dto.setDoctorId(schedule.getDoctor().getId());
            dto.setDoctorName(schedule.getDoctor().getUser().getName());
            dto.setDayOfWeek(schedule.getDayOfWeek());
            dto.setStartTime(schedule.getStartTime());
            dto.setEndTime(schedule.getEndTime());
            dto.setMaxTokensPerDay(schedule.getMaxTokensPerDay());
            return dto;
      }

}
