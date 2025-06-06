package com.project.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.project.backend.services.TokenValidationService;
import java.util.Map;

@Controller
public class DashboardController {
    
    @Autowired
    private TokenValidationService tokenValidationService;

    @GetMapping("/admin/dashboard/{token}")
    public String adminDashboard(@PathVariable String token, RedirectAttributes redirectAttributes) {
        Map<String, String> validationResult = tokenValidationService.validateToken(token, "admin");
        
        if (validationResult.isEmpty()) {
            return "admin/adminDashboard";
        } else {
            redirectAttributes.addFlashAttribute("error", "Invalid or expired session");
            return "redirect:/";
        }
    }

    @GetMapping("/doctor/dashboard/{token}")
    public String doctorDashboard(@PathVariable String token, RedirectAttributes redirectAttributes) {
        Map<String, String> validationResult = tokenValidationService.validateToken(token, "doctor");
        
        if (validationResult.isEmpty()) {
            return "doctor/doctorDashboard";
        } else {
            redirectAttributes.addFlashAttribute("error", "Invalid or expired session");
            return "redirect:/";
        }
    }

    @GetMapping("/patient/dashboard/{token}")
    public String patientDashboard(@PathVariable String token, RedirectAttributes redirectAttributes) {
        Map<String, String> validationResult = tokenValidationService.validateToken(token, "patient");
        
        if (validationResult.isEmpty()) {
            return "patient/patientDashboard";
        } else {
            redirectAttributes.addFlashAttribute("error", "Invalid or expired session");
            return "redirect:/";
        }
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }
}
