package com.project.app.controllers;

import com.project.app.dtos.DoctorDTO;
import com.project.app.services.DoctorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public ResponseEntity<?> getAllDoctors() {
        try {
            List<DoctorDTO> doctors = doctorService.getAllDoctorsAsDTOs();
            return ResponseEntity.ok(Map.of("doctors", doctors));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch doctors: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            return doctorService.registerDoctor(doctorDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getProfile(@PathVariable String email) {
        try {
            return doctorService.getDoctorProfile(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/{email}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String email,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        try {
            return doctorService.updateDoctorProfile(email, doctorDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/{email}/appointments")
    public ResponseEntity<?> getAppointments(@PathVariable String email) {
        try {
            return doctorService.getDoctorAppointments(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/{email}/prescriptions")
    public ResponseEntity<?> getPrescriptions(@PathVariable String email) {
        try {
            return doctorService.getDoctorPrescriptions(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }

    @PostMapping("/{email}/prescriptions")
    public ResponseEntity<?> createPrescription(
            @PathVariable String email,
            @Valid @RequestBody Map<String, Object> prescriptionData) {
        try {
            return doctorService.createPrescription(email, prescriptionData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create prescription: " + e.getMessage()));
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

    @GetMapping("/{email}/appointments/{id}")
    public ResponseEntity<?> getAppointmentDetails(
            @PathVariable String email,
            @PathVariable Long id) {
        try {
            return doctorService.getAppointmentDetails(email, id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointment details: " + e.getMessage()));
        }
    }

    @PutMapping("/{email}/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable String email,
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
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

    @GetMapping("/{email}/schedule")
    public ResponseEntity<?> getSchedule(
            @PathVariable String email,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            return doctorService.getDoctorSchedule(email, startDate, endDate);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch schedule: " + e.getMessage()));
        }
    }

    @GetMapping("/{email}/patients")
    public ResponseEntity<?> getPatients(@PathVariable String email) {
        try {
            return doctorService.getDoctorPatients(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch patients: " + e.getMessage()));
        }
    }
}