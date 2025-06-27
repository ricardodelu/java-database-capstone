package com.project.backend.controllers;

import com.project.backend.services.AppointmentService;
import com.project.backend.models.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.security.Principal;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> bookingData) {
        try {
            return appointmentService.bookAppointment(bookingData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create appointment: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            return appointmentService.cancelAppointment(id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to cancel appointment: " + e.getMessage()));
        }
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam String date) {
        try {
            return appointmentService.getAvailableSlots(doctorId, date);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch available slots: " + e.getMessage()));
        }
    }

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingAppointments(@RequestParam Long patientId) {
        try {
            return appointmentService.getUpcomingAppointments(patientId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch upcoming appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getAppointmentHistory(
            @RequestParam String email,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            return appointmentService.getAppointmentHistory(email, startDate, endDate);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointment history: " + e.getMessage()));
        }
    }
}