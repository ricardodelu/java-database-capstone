package com.project.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import com.project.backend.services.AppService;
import com.project.backend.services.TokenValidationService;
import com.project.backend.dtos.LoginDTO;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AppService appService;

    @Autowired
    private TokenValidationService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO credentials) {
        try {
            if (credentials.getEmail() == null || credentials.getPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email and password are required"
                ));
            }

            // Convert LoginDTO to Map for AppService
            Map<String, String> credentialsMap = Map.of(
                "username", credentials.getEmail(),
                "password", credentials.getPassword()
            );

            return appService.validateAdmin(credentialsMap);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            // Get system statistics as dashboard data
            return ResponseEntity.ok(appService.filterDoctors(null, null, null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to load dashboard: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            
            if (validation.isEmpty()) {
                String email = tokenService.extractEmailFromToken(token);
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "role", "admin",
                    "email", email
                ));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "valid", false,
                    "error", validation.get("error")
                ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Token validation failed: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStatistics(@RequestHeader("Authorization") String token) {
        try {
            Map<String, String> validation = appService.validateToken(token, "admin");
            
            if (!validation.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            // Use the filterDoctors method to get system statistics
            Map<String, Object> stats = appService.filterDoctors(null, null, null);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics: " + e.getMessage()));
        }
    }
}