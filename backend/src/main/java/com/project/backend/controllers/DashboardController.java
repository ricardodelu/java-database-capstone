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

    @GetMapping("/login")
    public String login() {
        return "index";
    }

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
    public String patientDashboard() {
        // The frontend will be responsible for fetching data via API calls.
        return "patient/patientDashboard";
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }
}
