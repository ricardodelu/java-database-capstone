package com.project.app.controllers;

import com.project.app.dtos.PatientDTO;
import com.project.app.services.PatientService;
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

    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getProfile(@PathVariable String email) {
        try {
            return patientService.getPatientProfile(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/{email}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String email,
            @Valid @RequestBody PatientDTO patientDTO) {
        try {
            return patientService.updatePatientProfile(email, patientDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/{email}/appointments")
    public ResponseEntity<?> getAppointments(@PathVariable String email) {
        try {
            return patientService.getPatientAppointments(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/{email}/prescriptions")
    public ResponseEntity<?> getPrescriptions(@PathVariable String email) {
        try {
            return patientService.getPatientPrescriptions(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }
}