package com.anurag.hospital.service;

import com.anurag.hospital.dto.DoctorDto;
import com.anurag.hospital.entity.Department;
import com.anurag.hospital.entity.Doctor;
import com.anurag.hospital.entity.User;
import com.anurag.hospital.enums.Role;
import com.anurag.hospital.repository.DepartmentRepository;
import com.anurag.hospital.repository.DoctorRepository;
import com.anurag.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

      @Autowired
      private DoctorRepository doctorRepository;

      @Autowired
      private UserRepository userRepository;

      @Autowired
      private DepartmentRepository departmentRepository;

      @Autowired
      private PasswordEncoder passwordEncoder;

      public List<DoctorDto> getAllDoctors(boolean all) {
            return getAllDoctors(null, all);
      }

      public List<DoctorDto> getAllDoctors(Long departmentId, boolean all) {
            List<Doctor> doctors;
            if (departmentId != null) {
                  doctors = all ? doctorRepository.findByDepartmentId(departmentId)
                                : doctorRepository.findByDepartmentIdAndActiveTrue(departmentId);
            } else {
                  doctors = all ? doctorRepository.findAll() : doctorRepository.findByActiveTrue();
            }
            return doctors.stream().map(this::mapToDto).collect(Collectors.toList());
      }

      public DoctorDto getDoctorById(Long id) {
            Doctor doctor = doctorRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Doctor not found with id " + id));
            return mapToDto(doctor);
      }

      @Transactional
      public DoctorDto createDoctor(DoctorDto dto) {
            String email = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
            if (userRepository.existsByEmail(email)) {
                  throw new RuntimeException("Email is already registered");
            }

            User user = new User();
            user.setName(dto.getName() != null ? dto.getName().trim() : "");
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(dto.getPassword() != null && !dto.getPassword().isBlank() ? dto.getPassword() : "doctor123"));
            user.setPhone(dto.getPhone());
            user.setRole(Role.DOCTOR);
            User savedUser = userRepository.save(user);

            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctor.setSpecialization(dto.getSpecialization());
            doctor.setQualification(dto.getQualification());
            doctor.setExperienceYears(dto.getExperienceYears());
            doctor.setConsultationFee(dto.getConsultationFee());
            doctor.setRoomNumber(dto.getRoomNumber());
            doctor.setActive(dto.getActive() != null ? dto.getActive() : true);

            if (dto.getDepartmentId() != null) {
                  Department dept = departmentRepository.findById(dto.getDepartmentId())
                        .orElse(null);
                  doctor.setDepartment(dept);
            }

            Doctor savedDoctor = doctorRepository.save(doctor);
            return mapToDto(savedDoctor);
      }

      @Transactional
      public DoctorDto updateDoctor(Long id, DoctorDto dto) {
            Doctor doctor = doctorRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Doctor not found with id " + id));

            User user = doctor.getUser();
            if (dto.getName() != null) user.setName(dto.getName());
            if (dto.getPhone() != null) user.setPhone(dto.getPhone());
            if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
                  user.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            userRepository.save(user);

            if (dto.getSpecialization() != null) doctor.setSpecialization(dto.getSpecialization());
            if (dto.getQualification() != null) doctor.setQualification(dto.getQualification());
            if (dto.getExperienceYears() != null) doctor.setExperienceYears(dto.getExperienceYears());
            if (dto.getConsultationFee() != null) doctor.setConsultationFee(dto.getConsultationFee());
            if (dto.getRoomNumber() != null) doctor.setRoomNumber(dto.getRoomNumber());
            if (dto.getActive() != null) {
                  doctor.setActive(dto.getActive());
            }

            if (dto.getDepartmentId() != null) {
                  Department dept = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
                  doctor.setDepartment(dept);
            }

            Doctor updatedDoctor = doctorRepository.save(doctor);
            return mapToDto(updatedDoctor);
      }

      @Transactional
      public void deleteDoctor(Long id) {
            Doctor doctor = doctorRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("Doctor not found with id " + id));
            doctor.setActive(false);
            doctorRepository.save(doctor);
      }

      private DoctorDto mapToDto(Doctor doctor) {
            DoctorDto dto = new DoctorDto();
            dto.setId(doctor.getId());
            if (doctor.getUser() != null) {
                  dto.setName(doctor.getUser().getName());
                  dto.setEmail(doctor.getUser().getEmail());
                  dto.setPhone(doctor.getUser().getPhone());
            }
            dto.setSpecialization(doctor.getSpecialization());
            dto.setQualification(doctor.getQualification());
            dto.setExperienceYears(doctor.getExperienceYears());
            dto.setConsultationFee(doctor.getConsultationFee());
            dto.setRoomNumber(doctor.getRoomNumber());
            dto.setActive(doctor.getActive());
            if (doctor.getDepartment() != null) {
                  dto.setDepartmentId(doctor.getDepartment().getId());
                  dto.setDepartmentName(doctor.getDepartment().getName());
            }
            return dto;
      }

}
