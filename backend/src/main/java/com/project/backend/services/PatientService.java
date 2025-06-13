package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

import com.project.backend.models.Patient;
import com.project.backend.models.Appointment;
import com.project.backend.models.Prescription;
import com.project.backend.dtos.PatientDTO;
import com.project.backend.dtos.AppointmentDTO;
import com.project.backend.dtos.PrescriptionDTO;
import com.project.backend.repositories.PatientRepo;
import com.project.backend.repositories.AppointmentRepo;
import com.project.backend.repositories.PrescriptionRepo;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatientService {
    
    @Autowired
    private PatientRepo patientRepo;
    
    @Autowired
    private AppointmentRepo appointmentRepo;
    
    @Autowired
    private PrescriptionRepo prescriptionRepo;

    @Transactional
    public ResponseEntity<?> registerPatient(PatientDTO patientDTO) {
        try {
            if (patientRepo.existsByEmail(patientDTO.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email already registered"
                ));
            }

            Patient patient = new Patient();
            patient.setName(patientDTO.getName());
            patient.setEmail(patientDTO.getEmail());
            patient.setPhoneNumber(patientDTO.getPhoneNumber());
            patient.setAddress(patientDTO.getAddress());
            patient.setPassword(patientDTO.getPassword()); // Store password as-is

            patient = patientRepo.save(patient);

            return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "patient", convertToDTO(patient)
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> login(Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            Patient patient = patientRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            if (!password.equals(patient.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
            }

            return ResponseEntity.ok(Map.of(
                "patient", convertToDTO(patient)
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @Transactional
    public ResponseEntity<?> updatePatientProfile(String email, PatientDTO patientDTO) {
        try {
            Patient patient = patientRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            if (patientDTO.getName() != null) patient.setName(patientDTO.getName());
            if (patientDTO.getPhoneNumber() != null) patient.setPhoneNumber(patientDTO.getPhoneNumber());
            if (patientDTO.getAddress() != null) patient.setAddress(patientDTO.getAddress());
            if (patientDTO.getPassword() != null) {
                patient.setPassword(patientDTO.getPassword()); // Store password as-is
            }

            patientRepo.save(patient);
            return ResponseEntity.ok(convertToDTO(patient));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getPatientProfile(String email) {
        try {
            Patient patient = patientRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            return ResponseEntity.ok(convertToDTO(patient));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getPatientAppointments(String email) {
        try {
            Patient patient = patientRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            List<Appointment> appointments = appointmentRepo.findByPatient_Id(patient.getId());
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToAppointmentDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("appointments", appointmentDTOs));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getPatientPrescriptions(String email) {
        try {
            Patient patient = patientRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            List<Prescription> prescriptions = prescriptionRepo.findByPatientId(patient.getId());
            List<PrescriptionDTO> prescriptionDTOs = prescriptions.stream()
                .map(this::convertToPrescriptionDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("prescriptions", prescriptionDTOs));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }

    private PatientDTO convertToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setName(patient.getName());
        dto.setEmail(patient.getEmail());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setAddress(patient.getAddress());
        return dto;
    }

    private AppointmentDTO convertToAppointmentDTO(Appointment appointment) {
        return new AppointmentDTO(
            appointment.getId(),
            appointment.getDoctorId(),
            appointment.getDoctor().getName(),
            appointment.getPatientId(),
            appointment.getPatient().getName(),
            appointment.getPatient().getEmail(),
            appointment.getPatient().getPhoneNumber(),
            appointment.getPatient().getAddress(),
            appointment.getAppointmentTime(),
            appointment.getStatus()
        );
    }

    private PrescriptionDTO convertToPrescriptionDTO(Prescription prescription) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(prescription.getId());
        dto.setPatientId(prescription.getPatient().getId());
        dto.setDoctorId(prescription.getDoctor().getId());
        dto.setMedication(prescription.getMedication());
        dto.setDosage(prescription.getDosage());
        dto.setDuration(prescription.getDuration());
        dto.setNotes(prescription.getNotes());
        dto.setPrescribedAt(prescription.getPrescribedAt());
        dto.setPatientName(prescription.getPatient().getName());
        dto.setDoctorName(prescription.getDoctor().getName());
        return dto;
    }
}
