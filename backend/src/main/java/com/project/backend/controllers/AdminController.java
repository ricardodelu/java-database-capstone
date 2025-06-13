package com.project.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import com.project.backend.services.AppService;
import com.project.backend.dtos.DoctorDTO;
import com.project.backend.models.Doctor;
import com.project.backend.repositories.DoctorRepo;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AppService appService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
    
    @Autowired
    private DoctorRepo doctorRepository;
        try {
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
            System.out.println("=== Admin dashboard endpoint called ===");
            Map<String, Object> result = appService.getDoctors();
            System.out.println("Returning response: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error in admin dashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to load dashboard: " + e.getMessage()));
        }
    }
    
    @GetMapping("/test-doctors")
    public ResponseEntity<?> testDoctors() {
        try {
            System.out.println("=== Test doctors endpoint called ===");
            List<Doctor> doctors = doctorRepository.findAll();
            System.out.println("Direct repository call found: " + doctors.size() + " doctors");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", doctors.size(),
                "doctors", doctors
            ));
        } catch (Exception e) {
            System.err.println("Error in test doctors: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
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