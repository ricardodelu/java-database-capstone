package com.project.app.controllers;

import com.project.app.services.PrescriptionService;
import com.project.app.services.AppService;
import com.project.app.models.Prescription;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/api/prescription")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private AppService appService;

    /**
     * Save a new prescription
     * @param token The authentication token for the doctor
     * @param prescription The prescription details to be saved
     * @return Response with success message or error
     */
    @PostMapping("/{token}")
    public ResponseEntity<?> savePrescription(@PathVariable String token, @RequestBody Prescription prescription) {
        try {
            // Validate the token to ensure request is from a doctor
            if (!appService.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token. Only doctors can save prescriptions."));
            }

            // Save the prescription
            return prescriptionService.savePrescription(prescription);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to save prescription: " + e.getMessage()));
        }
    }

    /**
     * Get prescription by appointment ID
     * @param appointmentId The ID of the appointment to retrieve the prescription for
     * @param token The authentication token for the doctor
     * @return Response with prescription details or error message
     */
    @GetMapping("/{appointmentId}/{token}")
    public ResponseEntity<?> getPrescriptionByAppointmentId(@PathVariable String appointmentId, @PathVariable String token) {
        try {
            // Validate the token to ensure request is from a valid doctor
            if (!appService.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token. Only doctors can access prescriptions."));
            }

            // Get prescription by appointment ID
            Long appointmentIdLong = Long.parseLong(appointmentId);
            return prescriptionService.getPrescriptionByAppointmentId(appointmentIdLong);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve prescription: " + e.getMessage()));
        }
    }

} 