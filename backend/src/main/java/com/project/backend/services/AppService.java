package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.repositories.AdminRepo;
import com.project.backend.repositories.DoctorRepo;
import com.project.backend.repositories.PatientRepo;
import com.project.backend.repositories.AppointmentRepo;
import com.project.backend.repositories.PrescriptionRepo;
import com.project.backend.models.Admin;
import com.project.backend.models.Doctor;
import com.project.backend.models.Patient;
import com.project.backend.models.Appointment;
import com.project.backend.models.Prescription;
import com.project.backend.dtos.DoctorDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AppService {
    
    @Autowired
    private TokenValidationService tokenService;
    
    @Autowired
    private AdminRepo adminRepository;

    @Autowired
    private DoctorRepo doctorRepository;

    @Autowired
    private PatientRepo patientRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Lazy
    @Autowired
    private DoctorService doctorService;
    
    @Lazy
    @Autowired
    private PatientService patientService;
    
    @Autowired
    private AppointmentRepo appointmentRepo;

    @Autowired
    private PrescriptionRepo prescriptionRepo;
    
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

            // Log DB connection info and login attempt
            System.err.println("[DEBUG] DB URL: " + System.getProperty("spring.datasource.url"));
            System.err.println("[DEBUG] DB User: " + System.getProperty("spring.datasource.username"));
            System.err.println("[DEBUG] Attempting login for username: " + username);

            Admin admin = adminRepository.findByUsername(username)
                .orElse(null);

            System.err.println("[DEBUG] Admin lookup result: " + (admin != null ? "FOUND" : "NOT FOUND"));
            if (admin != null) {
                System.err.println("[DEBUG] Username in DB: " + admin.getUsername());
                System.err.println("[DEBUG] Password hash in DB: " + admin.getPassword());
                System.err.println("[DEBUG] Password matches: " + passwordEncoder.matches(password, admin.getPassword()));
            }

            if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
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
            System.err.println("AppService.validateAdmin caught an exception:");
            e.printStackTrace(System.err);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Authentication failed"
            ));
        }
    }

    public Map<String, Object> getDoctors() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Doctor> doctors = doctorRepository.findAll();
            response.put("success", true);
            response.put("doctors", doctors);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to fetch doctors");
        }
        return response;
    }

    public boolean validatePatient(Patient patient) {
        try {
            return patientRepository.findByEmailOrPhoneNumber(
                patient.getEmail(), 
                patient.getPhoneNumber()
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

    public ResponseEntity<?> getPatientAppointments(String token) {
        try {
            Map<String, String> validation = validateToken(token, "patient");
            if (!validation.isEmpty()) {
                return ResponseEntity.badRequest().body(validation);
            }

            String email = tokenService.extractEmailFromToken(token);
            return patientService.getPatientAppointments(email);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch appointments"
            ));
        }
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor createDoctor(DoctorDTO doctorDTO) {
        Doctor doctor = new Doctor();
        doctor.setName(doctorDTO.getName());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setLicenseNumber(doctorDTO.getLicenseNumber());
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, DoctorDTO doctorDTO) {
        Optional<Doctor> existingDoctor = doctorRepository.findById(id);
        if (existingDoctor.isEmpty()) {
            throw new RuntimeException("Doctor not found");
        }

        Doctor doctor = existingDoctor.get();
        doctor.setName(doctorDTO.getName());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setLicenseNumber(doctorDTO.getLicenseNumber());
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found");
        }
        doctorRepository.deleteById(id);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public List<Appointment> getAllAppointments(String status, String date) {
        if (status != null && date != null) {
            LocalDate parsedDate = LocalDate.parse(date);
            LocalDateTime start = parsedDate.atStartOfDay();
            LocalDateTime end = parsedDate.plusDays(1).atStartOfDay();
            return appointmentRepo.findByStatusAndDate(status, start, end);
        } else if (status != null) {
            return appointmentRepo.findByStatus(status);
        } else if (date != null) {
            LocalDate parsedDate = LocalDate.parse(date);
            LocalDateTime start = parsedDate.atStartOfDay();
            LocalDateTime end = parsedDate.plusDays(1).atStartOfDay();
            return appointmentRepo.findByDate(start, end);
        }
        return appointmentRepo.findAll();
    }

    public List<Prescription> getAllPrescriptions(String doctorId, String patientId) {
        if (doctorId != null && patientId != null) {
            return prescriptionRepo.findByDoctorIdAndPatientId(
                Long.parseLong(doctorId), 
                Long.parseLong(patientId)
            );
        } else if (doctorId != null) {
            return prescriptionRepo.findByDoctorId(Long.parseLong(doctorId));
        } else if (patientId != null) {
            return prescriptionRepo.findByPatientId(Long.parseLong(patientId));
        }
        return prescriptionRepo.findAll();
    }
}
