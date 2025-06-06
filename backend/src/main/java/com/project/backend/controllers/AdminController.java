package com.project.backend.controllers;

import java.util.Arrays;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        // Add any necessary data to the model
        model.addAttribute("specialties", Arrays.asList(
            "Cardiology", "Dermatology", "Neurology", "Pediatrics"
        ));
        return "admin/dashboard";
    }
}