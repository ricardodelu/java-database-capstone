package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.repositories.AdminRepo;
import com.project.backend.repositories.DoctorRepo;
import com.project.backend.repositories.PatientRepo;
import com.project.backend.repositories.AppointmentRepo;
import com.project.backend.repositories.PrescriptionRepo;

import com.project.backend.models.Doctor;
import com.project.backend.models.Patient;
import com.project.backend.models.Appointment;
import com.project.backend.models.Prescription;
import com.project.backend.models.Admin;
import com.project.backend.dtos.DoctorDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AppService {
        
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
    
    @Autowired
    private AppointmentRepo appointmentRepo;

    @Autowired
    private PrescriptionRepo prescriptionRepo;   

    

    public Map<String, Object> getDoctors() {
        return getDoctors(null);
    }

    public Map<String, Object> getDoctors(String specialty) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("=== AppService.getDoctors() called with specialty: " + specialty + " ===");
            List<Doctor> doctors;
            if (specialty != null && !specialty.isEmpty() && !"all".equalsIgnoreCase(specialty)) {
                doctors = doctorRepository.findBySpecialtyIgnoreCase(specialty);
            } else {
                doctors = doctorRepository.findAll();
            }
            System.out.println("Found " + doctors.size() + " doctors in database");
            
            // Log first few doctors for debugging
            for (int i = 0; i < Math.min(3, doctors.size()); i++) {
                Doctor doc = doctors.get(i);
                System.out.println("Doctor " + (i+1) + ": " + doc.getName() + " (" + doc.getSpecialty() + ")");
            }
            
            response.put("success", true);
            response.put("doctors", doctors);
            System.out.println("Response prepared successfully");
        } catch (Exception e) {
            System.err.println("Error fetching doctors: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", "Failed to fetch doctors: " + e.getMessage());
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
    

    public ResponseEntity<?> getPatientAppointments(String email) {
            return patientService.getPatientAppointments(email);       
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor createDoctor(DoctorDTO doctorDTO) {
        Doctor doctor = new Doctor();
        doctor.setName(doctorDTO.getName());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        if (doctorDTO.getSpecialty() != null && !doctorDTO.getSpecialty().isEmpty()) {
            String specialty = doctorDTO.getSpecialty();
            doctor.setSpecialty(specialty.substring(0, 1).toUpperCase() + specialty.substring(1).toLowerCase());
        } else {
            doctor.setSpecialty(doctorDTO.getSpecialty());
        }
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
        if (doctorDTO.getSpecialty() != null && !doctorDTO.getSpecialty().isEmpty()) {
            String specialty = doctorDTO.getSpecialty();
            doctor.setSpecialty(specialty.substring(0, 1).toUpperCase() + specialty.substring(1).toLowerCase());
        } else {
            doctor.setSpecialty(doctorDTO.getSpecialty());
        }
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

    public ResponseEntity<?> validateAdmin(Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            System.out.println("Validating admin: " + username); // Debug log
            
            Optional<Admin> admin = adminRepository.findByUsername(username);
            
            if (admin.isEmpty()) {
                System.out.println("Admin not found: " + username); // Debug log
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
            }

            // Simple password check
            if (!admin.get().getPassword().equals(credentials.get("password"))) {
                System.out.println("Invalid password for admin: " + username); // Debug log
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
            }

            System.out.println("Admin login successful: " + username); // Debug log
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "role", "admin",
                "username", admin.get().getUsername(),
                "token", "dummy-token-" + System.currentTimeMillis() // Add a dummy token
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }
}
