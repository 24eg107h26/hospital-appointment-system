package com.anurag.hospital.service;

import com.anurag.hospital.dto.PatientDto;
import com.anurag.hospital.dto.RegisterDto;
import com.anurag.hospital.entity.Patient;
import com.anurag.hospital.entity.User;
import com.anurag.hospital.enums.Role;
import com.anurag.hospital.repository.AppointmentRepository;
import com.anurag.hospital.repository.PatientRepository;
import com.anurag.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

      @Autowired
      private PatientRepository patientRepository;

      @Autowired
      private UserRepository userRepository;

      @Autowired
      private AppointmentRepository appointmentRepository;

      @Autowired
      private PasswordEncoder passwordEncoder;

      public PatientDto getPatientProfile(String email) {
            User user = userRepository.findByEmail(email)
                  .orElseThrow(() -> new RuntimeException("User not found with email " + email));
            Patient patient = patientRepository.findByUserId(user.getId())
                  .orElseThrow(() -> new RuntimeException("Patient profile not found for user id " + user.getId()));
            return mapToDto(patient);
      }

      public RegisterDto getPatientProfileAsRegisterDto(String email) {
            PatientDto p = getPatientProfile(email);
            RegisterDto r = new RegisterDto();
            r.setId(p.getId());
            r.setName(p.getName());
            r.setEmail(p.getEmail());
            r.setPhone(p.getPhone());
            r.setAge(p.getAge());
            r.setGender(p.getGender());
            r.setAddress(p.getAddress());
            return r;
      }

      public List<PatientDto> getAllPatients(String query) {
            List<Patient> patients;
            if (query != null && !query.trim().isEmpty()) {
                  patients = patientRepository.searchPatients(query.trim());
            } else {
                  patients = patientRepository.findAll();
            }
            return patients.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      public PatientDto getPatientById(Long id) {
            Patient patient = patientRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Patient not found with id " + id));
            return mapToDto(patient);
      }

      @Transactional
      public PatientDto createPatient(PatientDto dto) {
            String email = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
            if (email.isEmpty()) {
                  throw new RuntimeException("Email is required");
            }
            if (userRepository.existsByEmail(email)) {
                  throw new RuntimeException("A user with email " + email + " already exists");
            }

            User user = new User();
            user.setName(dto.getName() != null ? dto.getName().trim() : "Patient");
            user.setEmail(email);
            user.setPhone(dto.getPhone());
            String rawPassword = dto.getPassword() != null && !dto.getPassword().isBlank() ? dto.getPassword() : "patient123";
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(Role.PATIENT);
            User savedUser = userRepository.save(user);

            Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setAge(dto.getAge());
            patient.setGender(dto.getGender());
            patient.setAddress(dto.getAddress());
            Patient savedPatient = patientRepository.save(patient);

            return mapToDto(savedPatient);
      }

      @Transactional
      public PatientDto updatePatient(Long id, PatientDto dto) {
            Patient patient = patientRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Patient not found with id " + id));

            User user = patient.getUser();
            if (dto.getName() != null) user.setName(dto.getName().trim());
            if (dto.getPhone() != null) user.setPhone(dto.getPhone().trim());
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                  user.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            userRepository.save(user);

            if (dto.getAge() != null) patient.setAge(dto.getAge());
            if (dto.getGender() != null) patient.setGender(dto.getGender());
            if (dto.getAddress() != null) patient.setAddress(dto.getAddress());

            Patient updated = patientRepository.save(patient);
            return mapToDto(updated);
      }

      @Transactional
      public void deletePatient(Long id) {
            Patient patient = patientRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Patient not found with id " + id));

            long apptCount = appointmentRepository.countByPatientId(id);
            if (apptCount > 0) {
                  throw new RuntimeException("Cannot delete patient who has " + apptCount + " associated appointment(s). Deactivate or keep for medical history records.");
            }

            User user = patient.getUser();
            patientRepository.delete(patient);
            if (user != null) {
                  userRepository.delete(user);
            }
      }

      private PatientDto mapToDto(Patient patient) {
            PatientDto dto = new PatientDto();
            dto.setId(patient.getId());
            if (patient.getUser() != null) {
                  dto.setUserId(patient.getUser().getId());
                  dto.setName(patient.getUser().getName());
                  dto.setEmail(patient.getUser().getEmail());
                  dto.setPhone(patient.getUser().getPhone());
            }
            dto.setAge(patient.getAge());
            dto.setGender(patient.getGender());
            dto.setAddress(patient.getAddress());
            dto.setCreatedAt(patient.getCreatedAt());
            return dto;
      }

}
