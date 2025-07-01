package com.project.backend.security;

import com.project.backend.models.Admin;
import com.project.backend.models.Doctor;
import com.project.backend.models.Patient;
import com.project.backend.repositories.AdminRepository;
import com.project.backend.repositories.DoctorRepository;
import com.project.backend.repositories.PatientRepository;
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

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find user in each repository
        Optional<Admin> admin = adminRepository.findByUsername(username);
        if (admin.isPresent()) {
            return buildUserDetails(admin.get().getUsername(), admin.get().getPassword(), "ROLE_ADMIN");
        }

        Optional<Doctor> doctor = doctorRepository.findByEmail(username);
        if (doctor.isPresent()) {
            return buildUserDetails(doctor.get().getEmail(), doctor.get().getPassword(), "ROLE_DOCTOR");
        }

        Optional<Patient> patient = patientRepository.findByEmail(username);
        if (patient.isPresent()) {
            return buildUserDetails(patient.get().getEmail(), patient.get().getPassword(), "ROLE_PATIENT");
        }

        throw new UsernameNotFoundException("User not found with username or email: " + username);
    }

    private UserDetails buildUserDetails(String username, String password, String role) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(role));
        
        return new User(username, password, authorities);
    }
}
