package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.models.Prescription;
import com.project.backend.repositories.PrescriptionRepo;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@Service
public class PrescriptionService {
    
    @Autowired
    private PrescriptionRepo prescriptionRepo;

    @Transactional
    public ResponseEntity<?> savePrescription(Prescription prescription) {
        try {
            // Set creation time
            prescription.prePersist();
            
            // Save prescription
            Prescription saved = prescriptionRepo.save(prescription);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "message", "Prescription saved",
                    "id", saved.getId()
                ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to save prescription: " + e.getMessage()
                ));
        }
    }

    public ResponseEntity<?> getPrescription(String appointmentId) {
        try {
            List<Prescription> prescriptions = prescriptionRepo
                .findByAppointmentId(appointmentId);
            
            if (prescriptions.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "error", "No prescription found for this appointment"
                    ));
            }

            return ResponseEntity.ok(Map.of(
                "prescriptions", prescriptions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to fetch prescription: " + e.getMessage()
                ));
        }
    }

    public ResponseEntity<?> getPatientPrescriptions(String patientId, boolean activeOnly) {
        try {
            List<Prescription> prescriptions;
            
            if (activeOnly) {
                prescriptions = prescriptionRepo
                    .findByPatientIdAndActive(patientId, true);
            } else {
                prescriptions = prescriptionRepo
                    .findByPatientIdOrderByDateDesc(patientId);
            }

            return ResponseEntity.ok(Map.of(
                "prescriptions", prescriptions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to fetch prescriptions: " + e.getMessage()
                ));
        }
    }
}
