package com.project.backend.controllers;

import com.project.backend.dtos.PatientDTO;
import com.project.backend.services.PatientService;
import com.project.backend.services.TokenValidationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private TokenValidationService tokenService;

    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody PatientDTO patientDTO) {
        try {
            return patientService.registerPatient(patientDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            if (credentials.get("email") == null || credentials.get("password") == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email and password are required"
                ));
            }
            return patientService.login(credentials);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return patientService.getPatientProfile(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody PatientDTO patientDTO) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return patientService.updatePatientProfile(email, patientDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(@RequestHeader("Authorization") String token) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return patientService.getPatientAppointments(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptions(@RequestHeader("Authorization") String token) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return patientService.getPatientPrescriptions(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = tokenService.validateToken(token, "patient");
            if (validation.isEmpty()) {
                String email = tokenService.extractEmailFromToken(token);
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "role", "patient",
                    "email", email
                ));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "error", validation.get("error")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Token validation failed: " + e.getMessage()));
        }
    }
} 