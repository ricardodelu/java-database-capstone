package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.project.backend.repositories.*;
import com.project.backend.models.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepo appointmentRepository;
    
    @Autowired
    private DoctorRepo doctorRepository;
    
    @Autowired
    private PatientRepo patientRepository;
    
    @Autowired
    private TokenValidationService tokenService;

    public ResponseEntity<?> bookAppointment(Appointment appointment, String token) {
        try {
            // Validate token and extract patient ID
            Map<String, String> validation = tokenService.validateToken(token, "patient");
            if (!validation.isEmpty()) {
                return ResponseEntity.badRequest().body(validation);
            }

            // Validate doctor exists
            if (!doctorRepository.existsById(appointment.getDoctorId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Doctor not found"
                ));
            }

            // Check if time slot is available
            if (isTimeSlotBooked(appointment.getDoctorId(), appointment.getAppointmentTime())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Time slot already booked"
                ));
            }

            // Set patient ID from token
            String patientId = tokenService.extractUserIdFromToken(token);
            appointment.setPatientId(patientId);
            
            // Save appointment
            Appointment saved = appointmentRepository.save(appointment);
            return ResponseEntity.ok(Map.of(
                "message", "Appointment booked successfully",
                "appointmentId", saved.getId().toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to book appointment: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> updateAppointment(Long appointmentId, Appointment updatedAppointment, String token) {
        try {
            // Validate token
            Map<String, String> validation = tokenService.validateToken(token, "patient");
            if (!validation.isEmpty()) {
                return ResponseEntity.badRequest().body(validation);
            }

            // Find existing appointment
            Optional<Appointment> existingAppointment = appointmentRepository.findById(appointmentId);
            if (existingAppointment.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Appointment not found"
                ));
            }

            // Verify ownership
            String patientId = tokenService.extractUserIdFromToken(token);
            if (!existingAppointment.get().getPatientId().equals(patientId)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Unauthorized to modify this appointment"
                ));
            }

            // Check if new time slot is available
            if (!existingAppointment.get().getAppointmentTime().equals(updatedAppointment.getAppointmentTime()) &&
                isTimeSlotBooked(updatedAppointment.getDoctorId(), updatedAppointment.getAppointmentTime())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "New time slot is already booked"
                ));
            }

            // Update appointment
            Appointment appointment = existingAppointment.get();
            appointment.setAppointmentTime(updatedAppointment.getAppointmentTime());
            appointment.setStatus(updatedAppointment.getStatus());
            
            appointmentRepository.save(appointment);
            
            return ResponseEntity.ok(Map.of(
                "message", "Appointment updated successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to update appointment: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> cancelAppointment(Long appointmentId, String token) {
        try {
            // Validate token
            Map<String, String> validation = tokenService.validateToken(token, "patient");
            if (!validation.isEmpty()) {
                return ResponseEntity.badRequest().body(validation);
            }

            // Find appointment
            Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);
            if (appointment.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Appointment not found"
                ));
            }

            // Verify ownership
            String patientId = tokenService.extractUserIdFromToken(token);
            if (!appointment.get().getPatientId().equals(patientId)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Unauthorized to cancel this appointment"
                ));
            }

            // Cancel appointment
            appointment.get().setStatus("CANCELLED");
            appointmentRepository.save(appointment.get());

            return ResponseEntity.ok(Map.of(
                "message", "Appointment cancelled successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to cancel appointment: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> getAppointments(String patientName, LocalDate date, String token) {
        try {
            // Validate token and role
            Map<String, String> validation = tokenService.validateToken(token, "doctor");
            if (!validation.isEmpty()) {
                return ResponseEntity.badRequest().body(validation);
            }

            // Get doctor ID from token
            String doctorId = tokenService.extractUserIdFromToken(token);

            // Get appointments for the date
            LocalDateTime startTime = date.atStartOfDay();
            LocalDateTime endTime = date.plusDays(1).atStartOfDay();

            List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetween(doctorId, startTime, endTime);

            // Filter by patient name if provided
            if (patientName != null && !patientName.isEmpty()) {
                appointments = appointments.stream()
                    .filter(a -> patientRepository.findById(a.getPatientId())
                        .map(p -> p.getName().toLowerCase().contains(patientName.toLowerCase()))
                        .orElse(false))
                    .toList();
            }

            return ResponseEntity.ok(Map.of(
                "appointments", appointments
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch appointments: " + e.getMessage()
            ));
        }
    }

    private boolean isTimeSlotBooked(String doctorId, LocalDateTime appointmentTime) {
        return appointmentRepository.existsByDoctorIdAndAppointmentTimeAndStatusNot(
            doctorId, 
            appointmentTime,
            "CANCELLED"
        );
    }
}
