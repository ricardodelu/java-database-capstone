package com.project.backend.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

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
        return "patient/patientDashboard";
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }
}
