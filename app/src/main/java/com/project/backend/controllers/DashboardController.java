package com.project.app.controllers;

import com.project.app.models.Doctor;
import com.project.app.models.Patient;
import com.project.app.services.DoctorService;
import com.project.app.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class DashboardController {

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
    
    @GetMapping("/login")
    public String login() {
        return "forward:/index.html";
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


}
