package com.project.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.List;

import com.project.backend.services.AppService;
import com.project.backend.dtos.DoctorDTO;
import com.project.backend.models.Doctor;
import com.project.backend.repositories.DoctorRepo;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.cors.allowed-origins}", 
             allowedHeaders = "*", 
             allowCredentials = "true")
public class AdminController {

    @Autowired
    private AppService appService;
    
    @Autowired
    private DoctorRepo doctorRepository;

    // Login is now handled by AuthController at /api/auth/signin

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> dashboard(@RequestParam(required = false) String specialty) {
        try {
            System.out.println("=== Admin dashboard endpoint called with specialty: " + specialty + " ===");
            Map<String, Object> result = appService.getDoctors(specialty);
            System.out.println("Returning response: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error in admin dashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to load dashboard: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatistics() {
        try {
            return ResponseEntity.ok(appService.getDoctors());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics: " + e.getMessage()));
        }
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllDoctors() {
        try {
            return ResponseEntity.ok(appService.getAllDoctors());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch doctors: " + e.getMessage()));
        }
    }

    @PostMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            return ResponseEntity.ok(appService.createDoctor(doctorDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create doctor: " + e.getMessage()));
        }
    }

    @PutMapping("/doctors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPatients() {
        try {
            return ResponseEntity.ok(appService.getAllPatients());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch patients: " + e.getMessage()));
        }
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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