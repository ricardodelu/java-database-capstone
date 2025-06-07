package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.project.backend.repositories.AdminRepo;
import com.project.backend.repositories.DoctorRepo;
import com.project.backend.repositories.PatientRepo;
import com.project.backend.models.Admin;
import com.project.backend.models.Doctor;
import com.project.backend.models.Patient;
import com.project.backend.models.Appointment;
import com.project.backend.models.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Service
public class AppService {
    
    @Autowired
    private TokenValidationService tokenService;
    
    @Autowired
    private AdminRepo adminRepository;

    @Autowired
    private DoctorRepo doctorRepository;

    @Autowired
    private PatientRepo patientRepository;
    
    @Lazy
    @Autowired
    private DoctorService doctorService;
    
    @Lazy
    @Autowired
    private PatientService patientService;
    
    public Map<String, String> validateToken(String token, String role) {
        try {
            return tokenService.validateToken(token, role);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid or expired token");
            return error;
        }
    }

    public ResponseEntity<?> validateAdmin(Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            Admin admin = adminRepository.findByUsername(username)
                .orElse(null);

            if (admin != null && admin.getPassword().equals(password)) {
                String token = tokenService.generateToken(username, "admin");
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", "admin"
                ));
            }

            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid credentials"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Authentication failed"
            ));
        }
    }

    public Map<String, Object> filterDoctors(String name, String specialty, String time) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Doctor> doctors = doctorService.filterDoctors(name, specialty, time);
            response.put("success", true);
            response.put("doctors", doctors);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to filter doctors");
        }
        return response;
    }

    public int validateAppointment(Appointment appointment) {
        try {
            Doctor doctor = doctorRepository.findById(appointment.getDoctorId())
                .orElse(null);
            
            if (doctor == null) {
                return -1; // Doctor doesn't exist
            }

            List<String> availableSlots = doctorService.getDoctorAvailability(doctor.getId());
            if (availableSlots.contains(appointment.getTime())) {
                return 1; // Valid appointment time
            }
            return 0; // Time slot not available
        } catch (Exception e) {
            return -1; // Error occurred
        }
    }

    public boolean validatePatient(Patient patient) {
        try {
            return patientRepository.findByEmailOrPhone(
                patient.getEmail(), 
                patient.getPhone()
            ).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    public ResponseEntity<?> validatePatientLogin(Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            Patient patient = patientRepository.findByEmail(email)
                .orElse(null);

            if (patient != null && patient.getPassword().equals(password)) {
                String token = tokenService.generateToken(email, "patient");
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", "patient"
                ));
            }

            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid credentials"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Authentication failed"
            ));
        }
    }

    public ResponseEntity<?> filterPatientAppointments(String condition, String doctorName, String token) {
        try {
            Map<String, String> validation = validateToken(token, "patient");
            if (!validation.isEmpty()) {
                return ResponseEntity.badRequest().body(validation);
            }

            String patientId = tokenService.extractUserIdFromToken(token);
            List<Appointment> appointments = patientService.filterAppointments(
                patientId, 
                condition, 
                doctorName
            );

            return ResponseEntity.ok(Map.of(
                "appointments", appointments
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to filter appointments"
            ));
        }
    }
}
