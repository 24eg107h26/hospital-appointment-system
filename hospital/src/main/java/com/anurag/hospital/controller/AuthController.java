package com.anurag.hospital.controller;

import com.anurag.hospital.dto.LoginDto;
import com.anurag.hospital.dto.LoginResposnseDto;
import com.anurag.hospital.dto.RegisterDto;
import com.anurag.hospital.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class AuthController {

      @Autowired
      private AuthService authService;

      @PostMapping("/register")
      public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterDto dto) {
            String message = authService.register(dto);
            return ResponseEntity.ok(Map.of("message", message));
      }

      @PostMapping("/login")
      public ResponseEntity<LoginResposnseDto> login(@Valid @RequestBody LoginDto dto) {
            LoginResposnseDto response = authService.login(dto);
            return ResponseEntity.ok(response);
      }

}
