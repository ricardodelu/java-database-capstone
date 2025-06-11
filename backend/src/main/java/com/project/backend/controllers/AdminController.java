package com.project.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import com.project.backend.services.AppService;
import com.project.backend.services.TokenValidationService;
import com.project.backend.dtos.LoginDTO;
import java.util.Map;
import com.project.backend.dtos.DoctorDTO;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AppService appService;

    @Autowired
    private TokenValidationService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Username and password are required"
                ));
            }

            // Convert to Map for AppService
            Map<String, String> credentialsMap = Map.of(
                "username", username,
                "password", password
            );

            return appService.validateAdmin(credentialsMap);

        } catch (Exception e) {
            System.err.println("Admin login endpoint caught an exception:");
            e.printStackTrace(System.err);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            // Get system statistics as dashboard data
            return ResponseEntity.ok(appService.getDoctors());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to load dashboard: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            
            if (validation.isEmpty()) {
                String email = tokenService.extractEmailFromToken(token);
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "role", "admin",
                    "email", email
                ));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "valid", false,
                    "error", validation.get("error")
                ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Token validation failed: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStatistics(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            // Use the filterDoctors method to get system statistics
            Map<String, Object> stats = appService.getDoctors();
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics: " + e.getMessage()));
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }
            return ResponseEntity.ok(appService.getAllDoctors());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch doctors: " + e.getMessage()));
        }
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> createDoctor(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }
            return ResponseEntity.ok(appService.createDoctor(doctorDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create doctor: " + e.getMessage()));
        }
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<?> updateDoctor(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }
            return ResponseEntity.ok(appService.updateDoctor(id, doctorDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update doctor: " + e.getMessage()));
        }
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }
            appService.deleteDoctor(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete doctor: " + e.getMessage()));
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }
            return ResponseEntity.ok(appService.getAllPatients());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch patients: " + e.getMessage()));
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAllAppointments(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }
            return ResponseEntity.ok(appService.getAllAppointments(status, date));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getAllPrescriptions(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) String patientId) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }
            return ResponseEntity.ok(appService.getAllPrescriptions(doctorId, patientId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }
}