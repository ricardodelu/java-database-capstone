package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.project.backend.repositories.*;
import com.project.backend.models.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.ArrayList;
import com.project.backend.dtos.AppointmentDTO;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepo appointmentRepository;
    
    @Autowired
    private DoctorRepo doctorRepository;
    
    @Autowired
    private PatientRepo patientRepository;

    public ResponseEntity<?> bookAppointment(Map<String, Object> bookingData) {
        try {
            Long doctorId = Long.parseLong(bookingData.get("doctorId").toString());
            Long patientId = Long.parseLong(bookingData.get("patientId").toString());
            String date = (String) bookingData.get("date");
            String time = (String) bookingData.get("time");
            String reason = (String) bookingData.get("reason");

            Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            LocalDateTime appointmentTime = LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time));

            Appointment appointment = new Appointment();
            appointment.setDoctor(doctor);
            appointment.setPatient(patient);
            appointment.setAppointmentTime(appointmentTime);
            appointment.setStatus("BOOKED");

            Appointment saved = appointmentRepository.save(appointment);

            return ResponseEntity.ok(Map.of(
                "message", "Appointment booked successfully",
                "appointmentId", saved.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to book appointment: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> bookAppointment(Appointment appointment) {
        try {
            // Validate doctor exists
            if (!doctorRepository.existsById(appointment.getDoctor().getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Doctor not found"
                ));
            }

            // Check if time slot is available
            if (appointmentRepository.isTimeSlotBooked(
                appointment.getDoctor().getId(), 
                appointment.getAppointmentTime()
            )) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Time slot already booked"
                ));
            }

            // Validate patient exists
            if (!patientRepository.existsById(appointment.getPatient().getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Patient not found"
                ));
            }
            
            // Save appointment
            Appointment saved = appointmentRepository.save(appointment);
            return ResponseEntity.ok(Map.of(
                "message", "Appointment booked successfully",
                "appointmentId", saved.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to book appointment: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> updateAppointment(Long appointmentId, Appointment updatedAppointment) {
        try {
            // Find existing appointment
            Optional<Appointment> existingAppointment = appointmentRepository.findById(appointmentId);
            if (existingAppointment.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Appointment not found"
                ));
            }

            // Check if new time slot is available
            if (!existingAppointment.get().getAppointmentTime().equals(updatedAppointment.getAppointmentTime()) &&
                appointmentRepository.isTimeSlotBooked(
                    updatedAppointment.getDoctor().getId(), 
                    updatedAppointment.getAppointmentTime()
                )) {
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

    public ResponseEntity<?> cancelAppointment(Long appointmentId) {
        try {
            // Find appointment
            Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);
            if (appointment.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Appointment not found"
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

    public ResponseEntity<?> getUpcomingAppointments(Long patientId) {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Appointment> appointments = appointmentRepository.findByPatientIdAndAppointmentTimeAfter(
                patientId, now);

            appointments.sort(Comparator.comparing(Appointment::getAppointmentTime));

            return ResponseEntity.ok(Map.of("appointments", appointments));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch upcoming appointments: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> getAvailableSlots(Long doctorId, String date) {
        try {
            // Validate doctor exists
            if (!doctorRepository.existsById(doctorId)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Doctor not found"
                ));
            }

            LocalDate appointmentDate = LocalDate.parse(date);
            LocalDateTime startOfDay = appointmentDate.atStartOfDay();
            LocalDateTime endOfDay = appointmentDate.plusDays(1).atStartOfDay();

            // Get all appointments for the day
            List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                doctorId, startOfDay, endOfDay);

            // Generate available time slots (assuming 30-minute slots from 9 AM to 5 PM)
            List<String> allSlots = generateTimeSlots();
            Set<String> bookedSlots = appointments.stream()
                .map(apt -> apt.getAppointmentTime().toLocalTime().toString())
                .collect(Collectors.toSet());

            // Filter out booked slots
            List<String> availableSlots = allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("availableSlots", availableSlots));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch available slots: " + e.getMessage()
            ));
        }
    }

    public ResponseEntity<?> getAppointmentHistory(String email, String startDate, String endDate) {
        try {
            Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            LocalDateTime start = startDate != null ? 
                LocalDate.parse(startDate).atStartOfDay() : 
                LocalDate.now().minusMonths(1).atStartOfDay();
            
            LocalDateTime end = endDate != null ? 
                LocalDate.parse(endDate).plusDays(1).atStartOfDay() : 
                LocalDateTime.now();

            List<Appointment> appointments = appointmentRepository.findByPatientIdAndAppointmentTimeBetween(
                patient.getId(), start, end);

            // Sort by appointment time in descending order
            appointments.sort(Comparator.comparing(Appointment::getAppointmentTime).reversed());

            return ResponseEntity.ok(Map.of("appointments", appointments));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch appointment history: " + e.getMessage()
            ));
        }
    }

    private List<String> generateTimeSlots() {
        List<String> slots = new ArrayList<>();
        LocalTime start = LocalTime.of(9, 0); // 9 AM
        LocalTime end = LocalTime.of(17, 0);  // 5 PM
        
        while (start.isBefore(end)) {
            slots.add(start.toString());
            start = start.plusMinutes(30);
        }
        return slots;
    }
}
