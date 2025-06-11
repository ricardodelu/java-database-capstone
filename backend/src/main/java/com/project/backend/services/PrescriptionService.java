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
import com.project.backend.services.TokenValidationService;
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
    
    @Autowired
    private TokenValidationService tokenService;

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

    public ResponseEntity<?> getPrescription(Long prescriptionId, String token) {
        try {
            // Validate token
            Map<String, String> validation = tokenService.validateToken(token, "patient");
            if (!validation.isEmpty()) {
                return ResponseEntity.badRequest().body(validation);
            }

            // Find prescription
            Optional<Prescription> prescription = prescriptionRepo.findById(prescriptionId);
            if (prescription.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Prescription not found"
                ));
            }

            // Verify ownership
            String email = tokenService.extractEmailFromToken(token);
            Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
            if (!prescription.get().getPatient().getId().equals(patient.getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Unauthorized to view this prescription"
                ));
            }

            return ResponseEntity.ok(prescription.get());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch prescription: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> getPatientPrescriptions(String email) {
        try {
            Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            List<Prescription> prescriptions = prescriptionRepo.findByPatientId(patient.getId());
            return ResponseEntity.ok(Map.of("prescriptions", prescriptions));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch prescriptions: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> getDoctorPrescriptions(String email) {
        try {
            Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            List<Prescription> prescriptions = prescriptionRepo.findByDoctorId(doctor.getId());
            return ResponseEntity.ok(Map.of("prescriptions", prescriptions));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch prescriptions: " + e.getMessage()
            ));
        }
    }
}
