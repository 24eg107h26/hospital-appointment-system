package com.anurag.hospital.service;

import com.anurag.hospital.dto.LoginDto;
import com.anurag.hospital.dto.LoginResposnseDto;
import com.anurag.hospital.dto.RegisterDto;
import com.anurag.hospital.entity.Doctor;
import com.anurag.hospital.entity.Patient;
import com.anurag.hospital.entity.User;
import com.anurag.hospital.enums.Role;
import com.anurag.hospital.repository.DoctorRepository;
import com.anurag.hospital.repository.PatientRepository;
import com.anurag.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

      @Autowired
      private UserRepository userRepository;

      @Autowired
      private PatientRepository patientRepository;

      @Autowired
      private DoctorRepository doctorRepository;

      @Autowired
      private PasswordEncoder passwordEncoder;

      @Autowired
      private JwtService jwtService;

      @Transactional
      public String register(RegisterDto dto) {
            String email = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
            if (userRepository.existsByEmail(email)) {
                  throw new RuntimeException("Email is already registered");
            }

            User user = new User();
            user.setName(dto.getName() != null ? dto.getName().trim() : "");
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
            user.setRole(Role.PATIENT);
            User savedUser = userRepository.save(user);

            Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setAge(dto.getAge());
            patient.setGender(dto.getGender());
            patient.setAddress(dto.getAddress() != null ? dto.getAddress().trim() : "");
            patientRepository.save(patient);

            return "Registration successful";
      }

      public LoginResposnseDto login(LoginDto dto) {
            String email = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
            User user = userRepository.findByEmail(email)
                  .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                  throw new RuntimeException("Invalid email or password");
            }

            Long doctorId = null;
            Long patientId = null;

            if (user.getRole() == Role.DOCTOR) {
                  Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
                  if (doctor != null) {
                        doctorId = doctor.getId();
                  }
            } else if (user.getRole() == Role.PATIENT) {
                  Patient patient = patientRepository.findByUserId(user.getId()).orElse(null);
                  if (patient != null) {
                        patientId = patient.getId();
                  }
            }

            String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

            return new LoginResposnseDto(
                  token,
                  user.getRole().name(),
                  user.getName(),
                  user.getId(),
                  doctorId,
                  patientId
            );
      }

}
