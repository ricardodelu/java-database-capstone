package com.project.backend.controllers;

import com.project.backend.models.Doctor;
import com.project.backend.models.Patient;
import com.project.backend.services.DoctorService;
import com.project.backend.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class DashboardController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        System.out.println("AdminDashboard endpoint hit - returning admin/adminDashboard"); // Debug log
        return "admin/adminDashboard";
    }
    
    @GetMapping("/test/admin")
    public String testAdmin() {
        System.out.println("Test admin endpoint hit"); // Debug log
        return "admin/adminDashboard";
    }
    
    @GetMapping("/test/simple")
    public String testSimple() {
        System.out.println("Test simple endpoint hit"); // Debug log
        return "test";
    }

    @GetMapping("/doctor/dashboard")
    public String doctorDashboard() {
        return "doctor/doctorDashboard";
    }

    @GetMapping("/patient/dashboard")
    public String patientDashboard(Model model, Principal principal) {
        List<Doctor> doctors = doctorService.getAllDoctors();
        List<String> specialties = doctors.stream()
                                          .map(Doctor::getSpecialty)
                                          .distinct()
                                          .sorted()
                                          .collect(Collectors.toList());

        // The patient object is needed for the booking form to get the patientId.
        // We get the email of the logged-in user from the Principal object.
        Patient patient = patientService.findPatientByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("Patient not found for email: " + principal.getName()));

        model.addAttribute("doctors", doctors);
        model.addAttribute("specialties", specialties);
        model.addAttribute("patient", patient);
        return "patient/patientDashboard";
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }
}
