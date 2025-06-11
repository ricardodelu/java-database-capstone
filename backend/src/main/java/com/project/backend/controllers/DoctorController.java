package com.project.backend.controllers;

import com.project.backend.dtos.DoctorDTO;
import com.project.backend.services.DoctorService;
import com.project.backend.services.TokenValidationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private TokenValidationService tokenService;

    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            return doctorService.registerDoctor(doctorDTO);
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
            return doctorService.login(credentials);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return doctorService.getDoctorProfile(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return doctorService.updateDoctorProfile(email, doctorDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(@RequestHeader("Authorization") String token) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return doctorService.getDoctorAppointments(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptions(@RequestHeader("Authorization") String token) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return doctorService.getDoctorPrescriptions(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<?> createPrescription(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody Map<String, Object> prescriptionData) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return doctorService.createPrescription(email, prescriptionData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create prescription: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = tokenService.validateToken(token, "doctor");
            if (validation.isEmpty()) {
                String email = tokenService.extractEmailFromToken(token);
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "role", "doctor",
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

    @GetMapping("/{id}/availability")
    public ResponseEntity<?> getAvailability(
            @PathVariable Long id,
            @RequestParam String date) {
        try {
            return doctorService.getDoctorAvailability(id, date);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch availability: " + e.getMessage()));
        }
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<?> getAppointmentDetails(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return doctorService.getAppointmentDetails(email, id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointment details: " + e.getMessage()));
        }
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            String newStatus = statusUpdate.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Status is required"));
            }
            return doctorService.updateAppointmentStatus(email, id, newStatus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update appointment status: " + e.getMessage()));
        }
    }

    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            return doctorService.getDoctorSchedule(email, startDate, endDate);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch schedule: " + e.getMessage()));
        }
    }
} 