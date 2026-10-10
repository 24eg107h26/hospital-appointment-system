package com.anurag.hospital.service;

import com.anurag.hospital.dto.AppointmentDto;
import com.anurag.hospital.entity.Appointment;
import com.anurag.hospital.entity.Doctor;
import com.anurag.hospital.entity.Patient;
import com.anurag.hospital.entity.Schedule;
import com.anurag.hospital.entity.User;
import com.anurag.hospital.enums.AppointmentStatus;
import com.anurag.hospital.repository.AppointmentRepository;
import com.anurag.hospital.repository.DoctorRepository;
import com.anurag.hospital.repository.PatientRepository;
import com.anurag.hospital.repository.ScheduleRepository;
import com.anurag.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

      @Autowired
      private AppointmentRepository appointmentRepository;

      @Autowired
      private PatientRepository patientRepository;

      @Autowired
      private DoctorRepository doctorRepository;

      @Autowired
      private ScheduleRepository scheduleRepository;

      @Autowired
      private UserRepository userRepository;

      @Transactional
      public AppointmentDto bookAppointment(String userEmail, boolean isAdmin, AppointmentDto dto) {
            Patient patient;
            if (isAdmin && dto.getPatientId() != null) {
                  patient = patientRepository.findById(dto.getPatientId())
                        .orElseThrow(() -> new RuntimeException("Patient not found with id " + dto.getPatientId()));
            } else {
                  User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new RuntimeException("User not found with email " + userEmail));
                  patient = patientRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Patient profile not found for user id " + user.getId()));
            }

            LocalDate date = dto.getAppointmentDate();

            // 1. Validate date
            if (date == null || date.isBefore(LocalDate.now())) {
                  throw new RuntimeException("Appointment date cannot be in the past");
            }

            // 2. Doctor active
            Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                  .orElseThrow(() -> new RuntimeException("Doctor not found with id " + dto.getDoctorId()));
            if (doctor.getActive() == null || !doctor.getActive()) {
                  throw new RuntimeException("Doctor is currently inactive and cannot accept appointments");
            }

            // 3. Schedule limit check (if schedule exists, check max tokens)
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            Optional<Schedule> scheduleOpt = scheduleRepository.findByDoctorIdAndDayOfWeek(doctor.getId(), dayOfWeek);
            int maxTokens = scheduleOpt.map(Schedule::getMaxTokensPerDay).orElse(50);

            // 4. No duplicate active booking for same patient and doctor on that date
            boolean alreadyBooked = appointmentRepository.existsByPatientIdAndDoctorIdAndAppointmentDateAndStatusNot(
                  patient.getId(), doctor.getId(), date, AppointmentStatus.CANCELLED);
            if (alreadyBooked) {
                  throw new RuntimeException("Patient already has an active appointment with this doctor on " + date);
            }

            // 5. Token limit not reached
            long activeCount = appointmentRepository.countByDoctorIdAndAppointmentDateAndStatusNot(
                  doctor.getId(), date, AppointmentStatus.CANCELLED);
            if (activeCount >= maxTokens) {
                  throw new RuntimeException("Maximum token limit of " + maxTokens + " reached for " + date);
            }

            // 6. Compute next token number
            int nextToken = appointmentRepository.findMaxTokenNumber(doctor.getId(), date) + 1;

            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setAppointmentDate(date);
            appointment.setTokenNumber(nextToken);
            appointment.setAppointmentTime(dto.getAppointmentTime() != null && !dto.getAppointmentTime().isBlank()
                  ? dto.getAppointmentTime() : "09:00 AM - 10:00 AM");
            appointment.setStatus(AppointmentStatus.BOOKED);
            appointment.setReason(dto.getReason());
            Appointment savedAppointment = appointmentRepository.save(appointment);

            return mapToDto(savedAppointment);
      }

      public AppointmentDto getAppointmentById(Long id) {
            Appointment app = appointmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));
            return mapToDto(app);
      }

      @Transactional
      public AppointmentDto updateAppointment(Long id, AppointmentDto dto) {
            Appointment appointment = appointmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));

            if (dto.getAppointmentDate() != null) {
                  appointment.setAppointmentDate(dto.getAppointmentDate());
            }
            if (dto.getAppointmentTime() != null) {
                  appointment.setAppointmentTime(dto.getAppointmentTime());
            }
            if (dto.getReason() != null) {
                  appointment.setReason(dto.getReason());
            }
            if (dto.getStatus() != null) {
                  appointment.setStatus(dto.getStatus());
            }
            if (dto.getDoctorId() != null && !dto.getDoctorId().equals(appointment.getDoctor().getId())) {
                  Doctor newDoctor = doctorRepository.findById(dto.getDoctorId())
                        .orElseThrow(() -> new RuntimeException("Doctor not found with id " + dto.getDoctorId()));
                  appointment.setDoctor(newDoctor);
            }

            Appointment updated = appointmentRepository.save(appointment);
            return mapToDto(updated);
      }

      @Transactional
      public void deleteAppointment(Long id) {
            Appointment appointment = appointmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));
            appointmentRepository.delete(appointment);
      }

      public List<AppointmentDto> getAppointmentsByDate(LocalDate date) {
            return appointmentRepository.findByAppointmentDateOrderByDoctorIdAscTokenNumberAsc(date)
                  .stream().map(this::mapToDto).collect(Collectors.toList());
      }

      public AppointmentDto getAppointmentByToken(String tokenNumberStr) {
            int tokenNum;
            String clean = tokenNumberStr.trim().toUpperCase();
            if (clean.startsWith("T")) {
                  clean = clean.substring(1);
            }
            try {
                  tokenNum = Integer.parseInt(clean);
            } catch (NumberFormatException e) {
                  throw new RuntimeException("Invalid token format: " + tokenNumberStr);
            }

            List<Appointment> apps = appointmentRepository.findByTokenNumber(tokenNum);
            if (apps.isEmpty()) {
                  throw new RuntimeException("No appointment found with token " + tokenNumberStr);
            }
            return mapToDto(apps.get(0));
      }

      public List<AppointmentDto> getMyAppointments(String patientEmail) {
            User user = userRepository.findByEmail(patientEmail)
                  .orElseThrow(() -> new RuntimeException("User not found with email " + patientEmail));
            Patient patient = patientRepository.findByUserId(user.getId())
                  .orElseThrow(() -> new RuntimeException("Patient profile not found for user id " + user.getId()));

            List<Appointment> appointments = appointmentRepository
                  .findByPatientIdOrderByAppointmentDateDescTokenNumberAsc(patient.getId());
            return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      @Transactional
      public AppointmentDto cancelAppointment(Long id, String userEmail, boolean isAdmin) {
            Appointment appointment = appointmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));

            if (!isAdmin) {
                  if (!appointment.getPatient().getUser().getEmail().equals(userEmail)) {
                        throw new RuntimeException("You are not authorized to cancel this appointment");
                  }
            }

            if (appointment.getStatus() != AppointmentStatus.BOOKED && appointment.getStatus() != AppointmentStatus.WAITING) {
                  throw new RuntimeException("Only BOOKED or WAITING appointments can be cancelled");
            }

            appointment.setStatus(AppointmentStatus.CANCELLED);
            Appointment updatedAppointment = appointmentRepository.save(appointment);
            return mapToDto(updatedAppointment);
      }

      @Transactional
      public AppointmentDto checkinAppointment(Long id) {
            Appointment appointment = appointmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));

            if (appointment.getStatus() != AppointmentStatus.BOOKED) {
                  throw new RuntimeException("Only BOOKED appointments can be checked in");
            }

            appointment.setStatus(AppointmentStatus.WAITING);
            Appointment updatedAppointment = appointmentRepository.save(appointment);
            return mapToDto(updatedAppointment);
      }

      @Transactional
      public AppointmentDto updateAppointmentStatus(Long id, AppointmentStatus status) {
            Appointment appointment = appointmentRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));
            appointment.setStatus(status);
            Appointment updatedAppointment = appointmentRepository.save(appointment);
            return mapToDto(updatedAppointment);
      }

      public List<AppointmentDto> getAppointmentsForAdmin(LocalDate date, Long doctorId) {
            LocalDate queryDate = date != null ? date : LocalDate.now();
            List<Appointment> appointments;
            if (doctorId != null) {
                  appointments = appointmentRepository.findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctorId, queryDate);
            } else {
                  appointments = appointmentRepository.findByAppointmentDateOrderByDoctorIdAscTokenNumberAsc(queryDate);
            }
            return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      public List<AppointmentDto> getAllAppointments() {
            return appointmentRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
      }

      public AppointmentDto mapToDto(Appointment appointment) {
            AppointmentDto dto = new AppointmentDto();
            dto.setId(appointment.getId());
            dto.setDoctorId(appointment.getDoctor().getId());
            dto.setDoctorName(appointment.getDoctor().getUser().getName());
            dto.setSpecialization(appointment.getDoctor().getSpecialization());
            if (appointment.getDoctor().getDepartment() != null) {
                  dto.setDepartmentName(appointment.getDoctor().getDepartment().getName());
            }

            dto.setPatientId(appointment.getPatient().getId());
            dto.setPatientName(appointment.getPatient().getUser().getName());
            dto.setPatientPhone(appointment.getPatient().getUser().getPhone());

            dto.setAppointmentDate(appointment.getAppointmentDate());
            dto.setAppointmentTime(appointment.getAppointmentTime() != null ? appointment.getAppointmentTime() : "09:00 AM - 10:00 AM");
            dto.setTokenNumber(appointment.getTokenNumber());
            dto.setTokenString(appointment.getTokenString());
            dto.setStatus(appointment.getStatus());
            dto.setReason(appointment.getReason());
            dto.setCreatedAt(appointment.getCreatedAt());
            return dto;
      }

}
