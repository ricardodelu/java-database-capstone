package com.project.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.backend.models.Doctor;
import com.project.backend.repositories.DoctorRepo;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private DoctorRepo doctorRepository;

    @GetMapping("/doctors")
    public ResponseEntity<?> testDoctors() {
        try {
            System.out.println("=== Test doctors endpoint called ===");
            List<Doctor> doctors = doctorRepository.findAll();
            System.out.println("Direct repository call found: " + doctors.size() + " doctors");
            
            // Create a simple doctor for testing if none exist
            if (doctors.isEmpty()) {
                System.out.println("No doctors found, creating test doctor...");
                Doctor testDoctor = new Doctor();
                testDoctor.setEmail("test@example.com");
                testDoctor.setName("Dr. Test");
                testDoctor.setPassword("password");
                testDoctor.setPhoneNumber("555-123-4567");
                testDoctor.setSpecialty("General");
                doctorRepository.save(testDoctor);
                
                doctors = doctorRepository.findAll();
                System.out.println("After creating test doctor, count: " + doctors.size());
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", doctors.size(),
                "doctors", doctors
            ));
        } catch (Exception e) {
            System.err.println("Error in test doctors: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/create-sample")
    public ResponseEntity<?> createSampleDoctors() {
        try {
            System.out.println("=== Creating sample doctors ===");
            
            // Clear existing doctors first
            doctorRepository.deleteAll();
            
            String[][] doctorData = {
                {"dr.adams@example.com", "Dr. Emily Adams", "pass12345", "555-101-2020", "Cardiology"},
                {"dr.johnson@example.com", "Dr. Mark Johnson", "secure4567", "555-202-3030", "Neurology"},
                {"dr.lee@example.com", "Dr. Sarah Lee", "leePass987", "555-303-4040", "Orthopedics"}
            };

            for (String[] data : doctorData) {
                Doctor doctor = new Doctor();
                doctor.setEmail(data[0]);
                doctor.setName(data[1]);
                doctor.setPassword(data[2]);
                doctor.setPhoneNumber(data[3]);
                doctor.setSpecialty(data[4]);
                doctorRepository.save(doctor);
                System.out.println("Created doctor: " + doctor.getName());
            }

            List<Doctor> doctors = doctorRepository.findAll();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sample doctors created successfully",
                "count", doctors.size(),
                "doctors", doctors
            ));
        } catch (Exception e) {
            System.err.println("Error creating sample doctors: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", e.getMessage()));
        }
    }
}