package com.anurag.hospital.service;

import com.anurag.hospital.dto.AppointmentDto;
import com.anurag.hospital.dto.TokenStatusDto;
import com.anurag.hospital.entity.Appointment;
import com.anurag.hospital.entity.Doctor;
import com.anurag.hospital.entity.User;
import com.anurag.hospital.enums.AppointmentStatus;
import com.anurag.hospital.repository.AppointmentRepository;
import com.anurag.hospital.repository.DoctorRepository;
import com.anurag.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QueueService {

      @Autowired
      private AppointmentRepository appointmentRepository;

      @Autowired
      private DoctorRepository doctorRepository;

      @Autowired
      private UserRepository userRepository;

      public List<AppointmentDto> getTodayAppointmentsForDoctor(String doctorEmail) {
            Doctor doctor = getDoctorByEmail(doctorEmail);
            LocalDate today = LocalDate.now();
            List<Appointment> appointments = appointmentRepository
                  .findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctor.getId(), today);
            return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      @Transactional
      public AppointmentDto callNextPatient(String doctorEmail) {
            Doctor doctor = getDoctorByEmail(doctorEmail);
            LocalDate today = LocalDate.now();

            List<Appointment> todayAppointments = appointmentRepository
                  .findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctor.getId(), today);

            // 1. Verify doctor doesn't already have an appointment IN_PROGRESS
            boolean hasInProgress = todayAppointments.stream()
                  .anyMatch(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS);

            if (hasInProgress) {
                  throw new RuntimeException("Finish the current patient first");
            }

            // 2. Pick lowest token with status WAITING, or BOOKED if none are WAITING
            Appointment nextAppointment = todayAppointments.stream()
                  .filter(a -> a.getStatus() == AppointmentStatus.WAITING)
                  .findFirst()
                  .orElseGet(() -> todayAppointments.stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.BOOKED)
                        .findFirst()
                        .orElse(null)
                  );

            if (nextAppointment == null) {
                  throw new RuntimeException("No more patients in the queue for today");
            }

            nextAppointment.setStatus(AppointmentStatus.IN_PROGRESS);
            Appointment saved = appointmentRepository.save(nextAppointment);
            return mapToDto(saved);
      }

      @Transactional
      public AppointmentDto callPatientById(Long appointmentId) {
            Appointment appointment = appointmentRepository.findById(appointmentId)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + appointmentId));
            appointment.setStatus(AppointmentStatus.IN_PROGRESS);
            Appointment saved = appointmentRepository.save(appointment);
            return mapToDto(saved);
      }

      @Transactional
      public AppointmentDto completeAppointmentById(Long appointmentId) {
            Appointment appointment = appointmentRepository.findById(appointmentId)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + appointmentId));
            appointment.setStatus(AppointmentStatus.COMPLETED);
            Appointment saved = appointmentRepository.save(appointment);
            return mapToDto(saved);
      }

      @Transactional
      public AppointmentDto callNextForDoctorId(Long doctorId) {
            LocalDate today = LocalDate.now();
            List<Appointment> todayAppointments = appointmentRepository
                  .findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctorId, today);

            Appointment nextAppointment = todayAppointments.stream()
                  .filter(a -> a.getStatus() == AppointmentStatus.WAITING)
                  .findFirst()
                  .orElseGet(() -> todayAppointments.stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.BOOKED)
                        .findFirst()
                        .orElse(null)
                  );

            if (nextAppointment == null) {
                  throw new RuntimeException("No more patients waiting in queue for doctor id " + doctorId);
            }

            nextAppointment.setStatus(AppointmentStatus.IN_PROGRESS);
            Appointment saved = appointmentRepository.save(nextAppointment);
            return mapToDto(saved);
      }

      @Transactional
      public AppointmentDto completeCurrentForDoctorId(Long doctorId) {
            LocalDate today = LocalDate.now();
            List<Appointment> todayAppointments = appointmentRepository
                  .findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctorId, today);

            Appointment inProgress = todayAppointments.stream()
                  .filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS)
                  .findFirst()
                  .orElseThrow(() -> new RuntimeException("No appointment currently in progress for doctor id " + doctorId));

            inProgress.setStatus(AppointmentStatus.COMPLETED);
            Appointment saved = appointmentRepository.save(inProgress);
            return mapToDto(saved);
      }

      public List<AppointmentDto> getQueue(Long doctorId, LocalDate date) {
            LocalDate queryDate = date != null ? date : LocalDate.now();
            List<Appointment> apps;
            if (doctorId != null) {
                  apps = appointmentRepository.findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctorId, queryDate);
            } else {
                  apps = appointmentRepository.findByAppointmentDateOrderByDoctorIdAscTokenNumberAsc(queryDate);
            }
            return apps.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      public AppointmentDto getCurrentServing(Long doctorId, LocalDate date) {
            LocalDate queryDate = date != null ? date : LocalDate.now();
            List<Appointment> apps;
            if (doctorId != null) {
                  apps = appointmentRepository.findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctorId, queryDate);
            } else {
                  apps = appointmentRepository.findByAppointmentDateOrderByDoctorIdAscTokenNumberAsc(queryDate);
            }

            return apps.stream()
                  .filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS)
                  .findFirst()
                  .map(this::mapToDto)
                  .orElse(null);
      }

      @Transactional
      public AppointmentDto completeAppointment(Long appointmentId, String doctorEmail) {
            Doctor doctor = getDoctorByEmail(doctorEmail);
            Appointment appointment = appointmentRepository.findById(appointmentId)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + appointmentId));

            if (!appointment.getDoctor().getId().equals(doctor.getId())) {
                  throw new RuntimeException("You can only complete your own appointments");
            }

            if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
                  throw new RuntimeException("Only in-progress appointments can be completed");
            }

            appointment.setStatus(AppointmentStatus.COMPLETED);
            Appointment saved = appointmentRepository.save(appointment);
            return mapToDto(saved);
      }

      public TokenStatusDto getTokenStatus(Long appointmentId, String patientEmail) {
            Appointment appointment = appointmentRepository.findById(appointmentId)
                  .orElseThrow(() -> new RuntimeException("Appointment not found with id " + appointmentId));

            if (!appointment.getPatient().getUser().getEmail().equals(patientEmail)) {
                  throw new RuntimeException("You are not authorized to view this token status");
            }

            Long doctorId = appointment.getDoctor().getId();
            LocalDate date = appointment.getAppointmentDate();
            int myToken = appointment.getTokenNumber();

            List<Appointment> allDayAppointments = appointmentRepository
                  .findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctorId, date);

            // Current token is the IN_PROGRESS one, or the last COMPLETED one if none is in progress
            int currentToken = 0;
            Appointment inProgress = allDayAppointments.stream()
                  .filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS)
                  .findFirst()
                  .orElse(null);

            if (inProgress != null) {
                  currentToken = inProgress.getTokenNumber();
            } else {
                  currentToken = allDayAppointments.stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                        .mapToInt(Appointment::getTokenNumber)
                        .max()
                        .orElse(0);
            }

            int patientsAhead = 0;
            String message;

            if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                  message = "Your consultation is completed.";
            } else if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
                  message = "Your appointment is cancelled.";
            } else if (appointment.getStatus() == AppointmentStatus.IN_PROGRESS) {
                  message = "It is your turn! Please proceed to the doctor's room.";
            } else {
                  patientsAhead = (int) allDayAppointments.stream()
                        .filter(a -> a.getTokenNumber() < myToken &&
                              (a.getStatus() == AppointmentStatus.BOOKED ||
                               a.getStatus() == AppointmentStatus.WAITING ||
                               a.getStatus() == AppointmentStatus.IN_PROGRESS))
                        .count();

                  if (patientsAhead == 0) {
                        message = "You are next in line. Please be ready.";
                  } else if (patientsAhead == 1) {
                        message = "1 patient ahead of you.";
                  } else {
                        message = patientsAhead + " patients ahead of you.";
                  }
            }

            return new TokenStatusDto(
                  appointment.getDoctor().getUser().getName(),
                  appointment.getAppointmentDate(),
                  myToken,
                  currentToken,
                  patientsAhead,
                  appointment.getStatus(),
                  message
            );
      }

      public List<Map<String, Object>> getAdminQueueOverview(LocalDate date, Long doctorId) {
            LocalDate queryDate = date != null ? date : LocalDate.now();
            List<Doctor> doctors;
            if (doctorId != null) {
                  Doctor doc = doctorRepository.findById(doctorId)
                        .orElseThrow(() -> new RuntimeException("Doctor not found with id " + doctorId));
                  doctors = List.of(doc);
            } else {
                  doctors = doctorRepository.findByActiveTrue();
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (Doctor doc : doctors) {
                  List<Appointment> appts = appointmentRepository
                        .findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doc.getId(), queryDate);

                  int currentToken = 0;
                  Appointment inProgress = appts.stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS)
                        .findFirst()
                        .orElse(null);

                  if (inProgress != null) {
                        currentToken = inProgress.getTokenNumber();
                  } else {
                        currentToken = appts.stream()
                              .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                              .mapToInt(Appointment::getTokenNumber)
                              .max()
                              .orElse(0);
                  }

                  long bookedCount = appts.stream().filter(a -> a.getStatus() == AppointmentStatus.BOOKED).count();
                  long waitingCount = appts.stream().filter(a -> a.getStatus() == AppointmentStatus.WAITING).count();
                  long inProgressCount = appts.stream().filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS).count();
                  long completedCount = appts.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
                  long cancelledCount = appts.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).count();

                  Map<String, Object> summary = new HashMap<>();
                  summary.put("doctorId", doc.getId());
                  summary.put("doctorName", doc.getUser().getName());
                  summary.put("specialization", doc.getSpecialization());
                  summary.put("roomNumber", doc.getRoomNumber());
                  summary.put("date", queryDate);
                  summary.put("currentToken", currentToken);
                  summary.put("bookedCount", bookedCount);
                  summary.put("waitingCount", waitingCount);
                  summary.put("inProgressCount", inProgressCount);
                  summary.put("completedCount", completedCount);
                  summary.put("cancelledCount", cancelledCount);
                  summary.put("totalAppointments", appts.size());

                  result.add(summary);
            }
            return result;
      }

      private Doctor getDoctorByEmail(String email) {
            User user = userRepository.findByEmail(email)
                  .orElseThrow(() -> new RuntimeException("User not found with email " + email));
            return doctorRepository.findByUserId(user.getId())
                  .orElseThrow(() -> new RuntimeException("Doctor profile not found for user id " + user.getId()));
      }

      private AppointmentDto mapToDto(Appointment appointment) {
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
