package com.anurag.hospital.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

      @ExceptionHandler(MethodArgumentNotValidException.class)
      public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : ex.getBindingResult().getFieldErrors()) {
                  errors.put(error.getField(), error.getDefaultMessage());
            }

            String firstError = errors.values().stream().findFirst().orElse("Validation failed");

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("timestamp", LocalDateTime.now());
            body.put("status", HttpStatus.BAD_REQUEST.value());
            body.put("message", firstError);
            body.put("errors", errors);

            return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
      }

      @ExceptionHandler(AccessDeniedException.class)
      public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("timestamp", LocalDateTime.now());
            body.put("status", HttpStatus.FORBIDDEN.value());
            body.put("message", "Access denied: you do not have permission to access this resource");

            return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
      }

      @ExceptionHandler(BadCredentialsException.class)
      public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("timestamp", LocalDateTime.now());
            body.put("status", HttpStatus.UNAUTHORIZED.value());
            body.put("message", "Invalid email or password");

            return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
      }

      @ExceptionHandler(RuntimeException.class)
      public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
            String message = ex.getMessage() != null ? ex.getMessage() : "Bad request";
            HttpStatus status = HttpStatus.BAD_REQUEST;

            if (message.toLowerCase().contains("not found")) {
                  status = HttpStatus.NOT_FOUND;
            } else if (message.toLowerCase().contains("invalid email or password")) {
                  status = HttpStatus.UNAUTHORIZED;
            } else if (message.toLowerCase().contains("unauthorized") || message.toLowerCase().contains("not authorized")) {
                  status = HttpStatus.FORBIDDEN;
            }

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("timestamp", LocalDateTime.now());
            body.put("status", status.value());
            body.put("message", message);

            return new ResponseEntity<>(body, status);
      }

      @ExceptionHandler(Exception.class)
      public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("timestamp", LocalDateTime.now());
            body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            body.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected server error occurred");

            return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
      }

}
