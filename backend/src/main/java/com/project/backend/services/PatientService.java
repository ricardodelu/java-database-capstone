package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.models.Patient;
import com.project.backend.models.Appointment;
import com.project.backend.dtos.AppointmentDTO;
import com.project.backend.repositories.PatientRepo;
import com.project.backend.repositories.AppointmentRepo;

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
    private TokenValidationService tokenService;

    @Transactional
    public int createPatient(Patient patient) {
        try {
            if (patientRepo.existsByEmail(patient.getEmail())) {
                return -1; // Patient already exists
            }
            patientRepo.save(patient);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    public ResponseEntity<?> getPatientAppointment(Long id, String token) {
        try {
            // Validate token and extract email
            String email = tokenService.extractEmailFromToken(token);
            Patient patient = patientRepo.findByEmail(email).orElse(null);

            if (patient == null || !patient.getId().equals(id)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Unauthorized access"
                ));
            }

            List<Appointment> appointments = appointmentRepo.findByPatientId(id);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "appointments", appointmentDTOs
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch appointments"
            ));
        }
    }

    public ResponseEntity<?> filterByCondition(String condition, Long id) {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Appointment> appointments;

            if ("past".equalsIgnoreCase(condition)) {
                appointments = appointmentRepo.findByPatientIdAndAppointmentTimeBefore(id, now);
            } else if ("future".equalsIgnoreCase(condition)) {
                appointments = appointmentRepo.findByPatientIdAndAppointmentTimeAfter(id, now);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid condition"
                ));
            }

            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "appointments", appointmentDTOs
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to filter appointments"
            ));
        }
    }

    public ResponseEntity<?> filterByDoctor(String name, Long patientId) {
        try {
            List<Appointment> appointments = appointmentRepo
                .filterByDoctorNameAndPatientId(name, patientId);

            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "appointments", appointmentDTOs
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to filter appointments"
            ));
        }
    }

    public ResponseEntity<?> filterByDoctorAndCondition(
            String condition, String name, Long patientId) {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Appointment> appointments = appointmentRepo
                .filterByDoctorNameAndPatientId(name, patientId);

            // Apply condition filter
            if ("past".equalsIgnoreCase(condition)) {
                appointments = appointments.stream()
                    .filter(a -> a.getAppointmentTime().isBefore(now))
                    .collect(Collectors.toList());
            } else if ("future".equalsIgnoreCase(condition)) {
                appointments = appointments.stream()
                    .filter(a -> a.getAppointmentTime().isAfter(now))
                    .collect(Collectors.toList());
            }

            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "appointments", appointmentDTOs
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to filter appointments"
            ));
        }
    }

    public ResponseEntity<?> getPatientDetails(String token) {
        try {
            String email = tokenService.extractEmailFromToken(token);
            Patient patient = patientRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            return ResponseEntity.ok(Map.of(
                "patient", patient
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch patient details"
            ));
        }
    }

    private AppointmentDTO convertToDTO(Appointment appointment) {
        return new AppointmentDTO(
            appointment.getId(),
            appointment.getDoctorId(),
            appointment.getDoctor().getName(),
            appointment.getPatientId(),
            appointment.getPatient().getName(),
            appointment.getPatient().getEmail(),
            appointment.getPatient().getPhone(),
            appointment.getPatient().getAddress(),
            appointment.getAppointmentTime(),
            appointment.getStatus()
        );
    }
}
