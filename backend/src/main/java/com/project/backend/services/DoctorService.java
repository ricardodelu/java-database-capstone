package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

import com.project.backend.models.Doctor;
import com.project.backend.models.Patient;
import com.project.backend.models.Appointment;
import com.project.backend.models.Prescription;
import com.project.backend.dtos.DoctorDTO;
import com.project.backend.dtos.AppointmentDTO;
import com.project.backend.dtos.PrescriptionDTO;
import com.project.backend.repositories.DoctorRepo;
import com.project.backend.repositories.PatientRepo;
import com.project.backend.repositories.AppointmentRepo;
import com.project.backend.repositories.PrescriptionRepo;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorService {
    
    @Autowired
    private DoctorRepo doctorRepo;
    
    @Autowired
    private PatientRepo patientRepo;
    
    @Autowired
    private AppointmentRepo appointmentRepo;
    
    @Autowired
    private PrescriptionRepo prescriptionRepo;
    

    @Transactional
    public ResponseEntity<?> registerDoctor(DoctorDTO doctorDTO) {
        try {
            if (doctorRepo.existsByEmail(doctorDTO.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
            }

            Doctor doctor = new Doctor();
            doctor.setName(doctorDTO.getName());
            doctor.setEmail(doctorDTO.getEmail());
            doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
            doctor.setSpecialization(doctorDTO.getSpecialization());
            doctor.setLicenseNumber(doctorDTO.getLicenseNumber());
            doctor.setPassword(doctorDTO.getPassword()); // Store password as-is
            
            doctor = doctorRepo.save(doctor);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "message", "Doctor registered successfully",
                    "doctor", convertToDTO(doctor)
                ));
        }    
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> login(Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            // Simple password check
            if (!password.equals(doctor.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
            }

            return ResponseEntity.ok(Map.of(
                "doctor", convertToDTO(doctor)
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getDoctorProfile(String email) {
        try {
            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            return ResponseEntity.ok(convertToDTO(doctor));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @Transactional
    public ResponseEntity<?> updateDoctorProfile(String email, DoctorDTO doctorDTO) {
        try {
            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            // Update only non-null fields
            if (doctorDTO.getName() != null) doctor.setName(doctorDTO.getName());
            if (doctorDTO.getPhoneNumber() != null) doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
            if (doctorDTO.getSpecialization() != null) doctor.setSpecialization(doctorDTO.getSpecialization());
            if (doctorDTO.getLicenseNumber() != null) doctor.setLicenseNumber(doctorDTO.getLicenseNumber());
            if (doctorDTO.getPassword() != null) {
                doctor.setPassword(doctorDTO.getPassword()); // Store password as-is
            }

            doctorRepo.save(doctor);
            return ResponseEntity.ok(convertToDTO(doctor));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getDoctorAppointments(String email) {
        try {
            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            List<Appointment> appointments = appointmentRepo.findByDoctor_Id(doctor.getId());
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToAppointmentDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("appointments", appointmentDTOs));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getDoctorPrescriptions(String email) {
        try {
            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            List<Prescription> prescriptions = prescriptionRepo.findByDoctorId(doctor.getId());
            List<PrescriptionDTO> prescriptionDTOs = prescriptions.stream()
                .map(this::convertToPrescriptionDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("prescriptions", prescriptionDTOs));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch prescriptions: " + e.getMessage()));
        }
    }

    @Transactional
    public ResponseEntity<?> createPrescription(String email, Map<String, Object> prescriptionData) {
        try {
            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            Long patientId = Long.valueOf(prescriptionData.get("patientId").toString());
            Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            Prescription prescription = new Prescription();
            prescription.setDoctor(doctor);
            prescription.setPatient(patient);
            prescription.setMedication((String) prescriptionData.get("medication"));
            prescription.setDosage((String) prescriptionData.get("dosage"));
            prescription.setDuration((String) prescriptionData.get("duration"));
            prescription.setNotes((String) prescriptionData.get("notes"));
            prescription.setPrescribedAt(LocalDateTime.now());
            prescription.setStatus("ACTIVE");

            prescriptionRepo.save(prescription);
            return ResponseEntity.ok(convertToPrescriptionDTO(prescription));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create prescription: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getDoctorAvailability(Long doctorId, String date) {
        try {
            Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            LocalDate appointmentDate = LocalDate.parse(date);
            LocalDateTime startOfDay = appointmentDate.atStartOfDay();
            LocalDateTime endOfDay = appointmentDate.plusDays(1).atStartOfDay();

            // Get all appointments for the day
            List<Appointment> appointments = appointmentRepo.findByDoctorIdAndAppointmentTimeBetween(
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch availability: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getAppointmentDetails(String email, Long appointmentId) {
        try {
            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

            // Verify the appointment belongs to this doctor
            if (!appointment.getDoctor().getId().equals(doctor.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Unauthorized to access this appointment"));
            }

            return ResponseEntity.ok(convertToAppointmentDTO(appointment));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch appointment details: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> updateAppointmentStatus(String email, Long appointmentId, String newStatus) {
        try {
            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

            // Verify the appointment belongs to this doctor
            if (!appointment.getDoctor().getId().equals(doctor.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Unauthorized to modify this appointment"));
            }

            // Validate status
            if (!isValidStatus(newStatus)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid appointment status"));
            }

            appointment.setStatus(newStatus);
            appointmentRepo.save(appointment);

            return ResponseEntity.ok(Map.of(
                "message", "Appointment status updated successfully",
                "appointment", convertToAppointmentDTO(appointment)
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update appointment status: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getDoctorSchedule(String email, String startDate, String endDate) {
        try {
            Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

            LocalDateTime start = startDate != null ? 
                LocalDate.parse(startDate).atStartOfDay() : 
                LocalDate.now().atStartOfDay();
            
            LocalDateTime end = endDate != null ? 
                LocalDate.parse(endDate).plusDays(1).atStartOfDay() : 
                LocalDate.now().plusDays(7).atStartOfDay();

            List<Appointment> appointments = appointmentRepo.findByDoctorIdAndAppointmentTimeBetween(
                doctor.getId(), start, end);

            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToAppointmentDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("schedule", appointmentDTOs));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch schedule: " + e.getMessage()));
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

    private boolean isValidStatus(String status) {
        return Arrays.asList("SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW")
            .contains(status.toUpperCase());
    }

    private DoctorDTO convertToDTO(Doctor doctor) {
        DoctorDTO dto = new DoctorDTO();
        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setEmail(doctor.getEmail());
        dto.setPhoneNumber(doctor.getPhoneNumber());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setLicenseNumber(doctor.getLicenseNumber());
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
