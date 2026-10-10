package com.anurag.hospital.config;

import com.anurag.hospital.entity.User;
import com.anurag.hospital.enums.Role;
import com.anurag.hospital.filter.JwtAuthenticationFilter;
import com.anurag.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class Security {

      @Autowired
      private JwtAuthenticationFilter jwtAuthenticationFilter;

      @Autowired
      private UserRepository userRepository;

      @Autowired
      private com.anurag.hospital.repository.DepartmentRepository departmentRepository;

      @Autowired
      private com.anurag.hospital.repository.DoctorRepository doctorRepository;

      // Set ALLOWED_ORIGINS env var in Render to your frontend URL, e.g.:
      // https://your-frontend.onrender.com
      // Multiple origins separated by commas are supported.
      @Value("${ALLOWED_ORIGINS:http://localhost:5173,http://localhost:4173}")
      private String allowedOriginsRaw;

      @Bean
      public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
      }

      @Bean
      public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                  .csrf(csrf -> csrf.disable())
                  .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                  .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                  .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/doctors/**", "/api/departments/**", "/api/queue/**").permitAll()
                        .anyRequest().authenticated()
                  )
                  .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
      }

      @Bean
      public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration configuration = new CorsConfiguration();

            // Parse comma-separated allowed origins from env var
            List<String> origins = Arrays.stream(allowedOriginsRaw.split(","))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .toList();

            configuration.setAllowedOrigins(origins);
            configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
            configuration.setAllowedHeaders(List.of("*"));
            configuration.setExposedHeaders(List.of("Authorization"));
            configuration.setAllowCredentials(true);

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
            return source;
      }

      @Bean
      public CommandLineRunner initDefaultAdmin(PasswordEncoder passwordEncoder) {
            return args -> {
                  userRepository.findByEmail("admin@hospital.com").ifPresent(userRepository::delete);

                  User admin = userRepository.findByEmail("admin@gmail.com").orElse(new User());
                  admin.setName("Admin");
                  admin.setEmail("admin@gmail.com");
                  admin.setPassword(passwordEncoder.encode("admin123"));
                  if (admin.getPhone() == null) {
                        admin.setPhone("0000000000");
                  }
                  admin.setRole(Role.ADMIN);
                  userRepository.save(admin);

                  // Seed sample departments if none exist
                  if (departmentRepository.count() == 0) {
                        List<com.anurag.hospital.entity.Department> sampleDepts = List.of(
                              new com.anurag.hospital.entity.Department(null, "General Medicine", "Primary healthcare, diagnosis, and treatment of adult diseases", true),
                              new com.anurag.hospital.entity.Department(null, "Cardiology", "Heart health, cardiovascular diseases, and treatment", true),
                              new com.anurag.hospital.entity.Department(null, "Orthopedics", "Bones, joints, ligaments, and muscular conditions", true),
                              new com.anurag.hospital.entity.Department(null, "Dermatology", "Skin, hair, and nail health and care", true),
                              new com.anurag.hospital.entity.Department(null, "Pediatrics", "Comprehensive medical care for infants, children, and adolescents", true),
                              new com.anurag.hospital.entity.Department(null, "ENT", "Ear, Nose, and Throat specialities and surgeries", true)
                        );
                        departmentRepository.saveAll(sampleDepts);
                  }

                  // Assign departments to doctors if not set
                  com.anurag.hospital.entity.Department generalMed = departmentRepository.findByName("General Medicine").orElse(null);
                  com.anurag.hospital.entity.Department cardio = departmentRepository.findByName("Cardiology").orElse(null);
                  doctorRepository.findAll().forEach(doc -> {
                        if (doc.getDepartment() == null) {
                              if (doc.getSpecialization() != null && doc.getSpecialization().toLowerCase().contains("cardio")) {
                                    doc.setDepartment(cardio);
                              } else {
                                    doc.setDepartment(generalMed);
                              }
                              doctorRepository.save(doc);
                        }
                  });
            };
      }

}

