package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.models.Prescription;
import com.project.backend.repositories.PrescriptionRepo;
import com.project.backend.repositories.DoctorRepo;
import com.project.backend.repositories.PatientRepo;
import com.project.backend.models.Doctor;
import com.project.backend.models.Patient;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {
    
    @Autowired
    private PrescriptionRepo prescriptionRepo;
    
    @Autowired
    private DoctorRepo doctorRepository;
    
    @Autowired
    private PatientRepo patientRepository;

    @Transactional
    public ResponseEntity<?> savePrescription(Prescription prescription) {
        try {
            prescription.prePersist();
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

    public ResponseEntity<?> getPrescription(Long prescriptionId) {
        try {
            Optional<Prescription> prescription = prescriptionRepo.findById(prescriptionId);
            if (prescription.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Prescription not found"
                ));
            }

            return ResponseEntity.ok(prescription.get());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch prescription: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> getPatientPrescriptions(Long patientId) {
        try {
            List<Prescription> prescriptions = prescriptionRepo.findByPatientId(patientId);
            return ResponseEntity.ok(Map.of("prescriptions", prescriptions));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch prescriptions: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> getDoctorPrescriptions(Long doctorId) {
        try {
            List<Prescription> prescriptions = prescriptionRepo.findByDoctorId(doctorId);
            return ResponseEntity.ok(Map.of("prescriptions", prescriptions));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch prescriptions: " + e.getMessage()
            ));
        }
    }
}
