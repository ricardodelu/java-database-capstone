package com.project.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import com.project.backend.services.AppService;
import com.project.backend.dtos.DoctorDTO;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AppService appService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");
            
            System.out.println("Admin login attempt - Username: " + username); // Debug log

            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Username and password are required"
                ));
            }

            ResponseEntity<?> result = appService.validateAdmin(credentials);
            System.out.println("Admin login result: " + result.getStatusCode()); // Debug log
            return result;

        } catch (Exception e) {
            System.out.println("Admin login error: " + e.getMessage()); // Debug log
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        try {
            return ResponseEntity.ok(appService.getDoctors());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to load dashboard: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStatistics() {
        try {
            return ResponseEntity.ok(appService.getDoctors());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics: " + e.getMessage()));
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        try {
            return ResponseEntity.ok(appService.getAllDoctors());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch doctors: " + e.getMessage()));
        }
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> createDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            return ResponseEntity.ok(appService.createDoctor(doctorDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create doctor: " + e.getMessage()));
        }
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<?> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            return ResponseEntity.ok(appService.updateDoctor(id, doctorDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update doctor: " + e.getMessage()));
        }
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        try {
            appService.deleteDoctor(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete doctor: " + e.getMessage()));
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients() {
        try {
            return ResponseEntity.ok(appService.getAllPatients());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch patients: " + e.getMessage()));
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAllAppointments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date) {
        try {
            return ResponseEntity.ok(appService.getAllAppointments(status, date));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getAllPrescriptions(
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) String patientId) {
        try {
            return ResponseEntity.ok(appService.getAllPrescriptions(doctorId, patientId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }
}