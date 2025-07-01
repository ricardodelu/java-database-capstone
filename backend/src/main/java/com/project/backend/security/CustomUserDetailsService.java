package com.project.backend.security;

import com.project.backend.models.Admin;
import com.project.backend.models.Doctor;
import com.project.backend.models.Patient;
import com.project.backend.repositories.AdminRepo;
import com.project.backend.repositories.DoctorRepo;
import com.project.backend.repositories.PatientRepo;
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
        logger.info("Attempting to load user by username: {}", username);
        
        try {
            // Try to find user in each repository
            // Try to find admin by username
            logger.debug("Searching for admin with username: {}", username);
            Optional<Admin> admin = adminRepository.findByUsername(username);
            if (admin.isPresent()) {
                logger.info("Found admin user: {}", username);
                logger.debug("Admin user details - Username: {}, Password: [PROTECTED]", 
                    admin.get().getUsername());
                return buildUserDetails(admin.get().getUsername(), admin.get().getPassword(), "ROLE_ADMIN");
            } else {
                logger.debug("No admin found with username: {}", username);
            }

            // Try to find doctor by email
            logger.debug("Searching for doctor with email: {}", username);
            Optional<Doctor> doctor = doctorRepository.findByEmail(username);
            if (doctor.isPresent()) {
                logger.info("Found doctor user: {}", username);
                logger.debug("Doctor user details - Email: {}, Password: [PROTECTED]", 
                    doctor.get().getEmail());
                return buildUserDetails(doctor.get().getEmail(), doctor.get().getPassword(), "ROLE_DOCTOR");
            } else {
                logger.debug("No doctor found with email: {}", username);
            }

            // Try to find patient by email
            logger.debug("Searching for patient with email: {}", username);
            Optional<Patient> patient = patientRepository.findByEmail(username);
            if (patient.isPresent()) {
                logger.info("Found patient user: {}", username);
                logger.debug("Patient user details - Email: {}, Password: [PROTECTED]", 
                    patient.get().getEmail());
                return buildUserDetails(patient.get().getEmail(), patient.get().getPassword(), "ROLE_PATIENT");
            } else {
                logger.debug("No patient found with email: {}", username);
            }

            String errorMsg = "User not found with username or email: " + username;
            logger.error(errorMsg);
            throw new UsernameNotFoundException(errorMsg);
        } catch (Exception e) {
            logger.error("Error loading user by username: " + username, e);
            throw e;
        }
    }

    private UserDetails buildUserDetails(String username, String password, String role) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(role));
        
        return new User(username, password, authorities);
    }
}
