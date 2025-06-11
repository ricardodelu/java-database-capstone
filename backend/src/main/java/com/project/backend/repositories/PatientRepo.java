package com.project.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.project.backend.models.Patient;
import java.util.Optional;

@Repository
public interface PatientRepo extends JpaRepository<Patient, Long> {
    
    /**
     * Find a patient by their email address
     * @param email the email to search for
     * @return Optional containing the patient if found
     */
    Optional<Patient> findByEmail(String email);
    
    /**
     * Find a patient by either email or phone number
     * @param email the email to search for
     * @param phoneNumber the phone number to search for
     * @return Optional containing the patient if found
     */
    Optional<Patient> findByEmailOrPhoneNumber(String email, String phoneNumber);
    
    /**
     * Check if a patient exists with the given email
     * @param email the email to check
     * @return true if a patient exists with this email
     */
    boolean existsByEmail(String email);
    
    /**
     * Check if a patient exists with the given phone number
     * @param phoneNumber the phone number to check
     * @return true if a patient exists with this phone number
     */
    boolean existsByPhoneNumber(String phoneNumber);
}
                                                                                                                                                         