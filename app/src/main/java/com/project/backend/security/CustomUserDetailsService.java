package com.project.app.security;

import com.project.app.models.Admin;
import com.project.app.models.Doctor;
import com.project.app.models.Patient;
import com.project.app.repositories.AdminRepo;
import com.project.app.repositories.DoctorRepo;
import com.project.app.repositories.PatientRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private AdminRepo adminRepository;

    @Autowired
    private DoctorRepo doctorRepository;

    @Autowired
    private PatientRepo patientRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("=== CUSTOM USER DETAILS SERVICE ===");
        logger.info("Attempting to load user by username/email: {}", username);
        
        if (username == null || username.trim().isEmpty()) {
            String errorMsg = "Username/email is null or empty";
            logger.error(errorMsg);
            throw new UsernameNotFoundException(errorMsg);
        }
        
        logger.debug("Available repositories: AdminRepo={}, DoctorRepo={}, PatientRepo={}", 
            adminRepository != null ? "initialized" : "null",
            doctorRepository != null ? "initialized" : "null",
            patientRepository != null ? "initialized" : "null");
            
        try {
            // Try to find admin by username first
            logger.debug("Attempting to find admin with username: {}", username);
            Optional<Admin> adminOpt = adminRepository.findByUsername(username);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                logger.info("ADMIN FOUND - ID: {}, Username: {}", 
                    admin.getId(), admin.getUsername());
                
                List<GrantedAuthority> authorities = new ArrayList<>();
                // Hardcode admin role since it's not stored in the entity
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                
                logger.debug("Admin authorities: {}", authorities);
                logger.debug("Creating UserDetails for admin: {}", admin.getUsername());
                    
                try {
                    UserDetails userDetails = new User(
                        admin.getUsername(), 
                        admin.getPassword(), 
                        authorities);
                    logger.debug("Successfully created UserDetails for admin: {}", admin.getUsername());
                    return userDetails;
                } catch (Exception e) {
                    logger.error("Error creating UserDetails for admin: {}", admin.getUsername(), e);
                    throw new RuntimeException("Error creating UserDetails for admin: " + e.getMessage(), e);
                }
            } else {
                logger.debug("No admin found with username: {}", username);
            }

            // Try to find doctor by email (since Doctor entity uses email for login)
            logger.debug("No admin found, attempting to find doctor with email: {}", username);
            Optional<Doctor> doctorOpt = doctorRepository.findByEmail(username);
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                logger.info("DOCTOR FOUND - ID: {}, Name: {}, Email: {}", 
                    doctor.getId(), doctor.getName(), doctor.getEmail());
                
                List<GrantedAuthority> authorities = new ArrayList<>();
                // Hardcode doctor role since it's not stored in the entity
                authorities.add(new SimpleGrantedAuthority("ROLE_DOCTOR"));
                
                logger.debug("Doctor authorities: {}", authorities);
                logger.debug("Creating UserDetails for doctor: {}", doctor.getEmail());
                
                try {
                    UserDetails userDetails = new User(
                        doctor.getEmail(), 
                        doctor.getPassword(), 
                        authorities);
                    logger.debug("Successfully created UserDetails for doctor: {}", doctor.getEmail());
                    return userDetails;
                } catch (Exception e) {
                    logger.error("Error creating UserDetails for doctor: {}", doctor.getEmail(), e);
                    throw new RuntimeException("Error creating UserDetails for doctor: " + e.getMessage(), e);
                }
            } else {
                logger.debug("No doctor found with username: {}", username);
            }

            // Try to find patient by email
            // Try to find patient by email
            logger.debug("No doctor found, attempting to find patient with email: {}", username);
            Optional<Patient> patientOpt = patientRepository.findByEmail(username);
            if (patientOpt.isPresent()) {
                Patient patient = patientOpt.get();
                logger.info("PATIENT FOUND - ID: {}, Name: {}, Email: {}", 
                    patient.getId(), patient.getName(), patient.getEmail());
                
                List<GrantedAuthority> authorities = new ArrayList<>();
                // Hardcode patient role since it's not stored in the entity
                authorities.add(new SimpleGrantedAuthority("ROLE_PATIENT"));
                
                logger.debug("Patient authorities: {}", authorities);
                logger.debug("Creating UserDetails for patient: {}", patient.getEmail());
                
                try {
                    UserDetails userDetails = new User(
                        patient.getEmail(), 
                        patient.getPassword(), 
                        authorities);
                    logger.debug("Successfully created UserDetails for patient: {}", patient.getEmail());
                    return userDetails;
                } catch (Exception e) {
                    logger.error("Error creating UserDetails for patient: {}", patient.getEmail(), e);
                    throw new RuntimeException("Error creating UserDetails for patient: " + e.getMessage(), e);
                }
            } else {
                logger.debug("No patient found with email: {}", username);
            }

            String errorMsg = "User not found with username/email: " + username;
            logger.error("USER NOT FOUND - No user found with username/email: {}", username);
            logger.debug("Searched in: Admins (by username), Doctors (by email), Patients (by email)");
            throw new UsernameNotFoundException("User not found with username/email: " + username);
            
        } catch (Exception e) {
            String errorMsg = String.format("ERROR loading user by username/email '%s': %s - %s", 
                username, e.getClass().getSimpleName(), e.getMessage());
                
            logger.error(errorMsg, e);
            
            // Log the full stack trace for debugging
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            logger.error("Full stack trace: {}", sw.toString());
            
            if (e.getCause() != null) {
                logger.error("Root cause: {} - {}", 
                    e.getCause().getClass().getSimpleName(), 
                    e.getCause().getMessage());
            }
            
            throw new UsernameNotFoundException("Error loading user by username/email: " + username, e);
        } finally {
            logger.info("=== END USER LOOKUP FOR: {} ===", username);
        }
    }

    private UserDetails buildUserDetails(String username, String password, String role) {
        logger.debug("Building UserDetails for username: {}, role: {}", username, role);
        
        if (password == null || password.trim().isEmpty()) {
            logger.error("Password is null or empty for user: {}", username);
            throw new IllegalArgumentException("Password cannot be empty");
        }
        
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(role));
        
        logger.debug("Created UserDetails with username: {}, role: {}", username, role);
        return new User(username, password, authorities);
    }
}
