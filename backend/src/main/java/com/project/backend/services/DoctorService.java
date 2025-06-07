package com.project.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.models.Doctor;
import com.project.backend.models.Login;
import com.project.backend.repositories.DoctorRepo;
import com.project.backend.repositories.AppointmentRepo;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorService {
    
    @Autowired
    private DoctorRepo doctorRepo;
    
    @Autowired
    private AppointmentRepo appointmentRepo;
    
    @Autowired
    private TokenValidationService tokenService;

    private static final List<String> AM_SLOTS = Arrays.asList("09:00", "10:00", "11:00");
    private static final List<String> PM_SLOTS = Arrays.asList("14:00", "15:00", "16:00");

    public List<String> getDoctorAvailability(Long doctorId, LocalDate date) {
        List<String> allSlots = new ArrayList<>(AM_SLOTS);
        allSlots.addAll(PM_SLOTS);

        // Get booked appointments
        List<String> bookedSlots = appointmentRepo
            .findByDoctorIdAndAppointmentTimeBetween(
                doctorId,
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay()
            )
            .stream()
            .map(a -> a.getAppointmentTime().toLocalTime().toString())
            .collect(Collectors.toList());

        // Remove booked slots
        return allSlots.stream()
            .filter(slot -> !bookedSlots.contains(slot))
            .collect(Collectors.toList());
    }

    @Transactional
    public int saveDoctor(Doctor doctor) {
        try {
            if (doctorRepo.existsByEmail(doctor.getEmail())) {
                return -1; // Doctor already exists
            }
            doctorRepo.save(doctor);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    @Transactional
    public int updateDoctor(Doctor doctor) {
        try {
            if (!doctorRepo.existsById(doctor.getId())) {
                return -1; // Doctor not found
            }
            doctorRepo.save(doctor);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    public List<Doctor> getDoctors() {
        return doctorRepo.findAll();
    }

    @Transactional
    public int deleteDoctor(Long id) {
        try {
            if (!doctorRepo.existsById(id)) {
                return -1; // Doctor not found
            }
            appointmentRepo.deleteAllByDoctorId(id);
            doctorRepo.deleteById(id);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    public ResponseEntity<?> validateDoctor(Login login) {
        try {
            Doctor doctor = doctorRepo.findByEmail(login.getEmail())
                .orElse(null);

            if (doctor != null && doctor.getPassword().equals(login.getPassword())) {
                String token = tokenService.generateToken(doctor.getEmail(), "doctor");
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", "doctor"
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

    public Map<String, Object> findDoctorByName(String name) {
        try {
            List<Doctor> doctors = doctorRepo.findByNameLike(name);
            return Map.of(
                "success", true,
                "doctors", doctors
            );
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "error", "Failed to find doctors"
            );
        }
    }

    public Map<String, Object> filterDoctorsByNameSpecilityandTime(
            String name, String specialty, String amOrPm) {
        try {
            List<Doctor> doctors = doctorRepo
                .findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(name, specialty);
            return Map.of(
                "success", true,
                "doctors", filterDoctorByTime(doctors, amOrPm)
            );
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "error", "Failed to filter doctors"
            );
        }
    }

    // Similar implementation for other filter methods...

    private List<Doctor> filterDoctorByTime(List<Doctor> doctors, String amOrPm) {
        List<String> timeSlots = "AM".equalsIgnoreCase(amOrPm) ? AM_SLOTS : PM_SLOTS;
        return doctors.stream()
            .filter(doctor -> doctor.getAvailableTimes().stream()
                .map(LocalTime::toString)
                .anyMatch(timeSlots::contains))
            .collect(Collectors.toList());
    }
}
