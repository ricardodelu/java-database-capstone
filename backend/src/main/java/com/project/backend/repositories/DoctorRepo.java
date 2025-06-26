package com.project.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.project.backend.models.Doctor;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepo extends JpaRepository<Doctor, Long> {
    
    /**
     * Find a doctor by email address
     */
    Optional<Doctor> findByEmail(String email);
    
    /**
     * Find doctors by partial name match
     */
    @Query("SELECT d FROM Doctor d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Doctor> findByNameLike(@Param("name") String name);
    
    /**
     * Filter doctors by name and specialty (case-insensitive)
     */
    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')) AND " +
           "LOWER(d.specialty) = LOWER(:specialty)")
    List<Doctor> findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(
        @Param("name") String name,
        @Param("specialty") String specialty
    );
    
    /**
     * Find doctors by specialty (case-insensitive)
     */
    @Query("SELECT d FROM Doctor d WHERE LOWER(d.specialty) = LOWER(:specialty)")
    List<Doctor> findBySpecialtyIgnoreCase(@Param("specialty") String specialty);

    List<Doctor> findBySpecialty(String specialty);
    
    /**
     * Check if email is already registered
     */
    boolean existsByEmail(String email);
    
    /**
     * Find available doctors by specialty and time slot
     */
    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.specialty) = LOWER(:specialty) AND " +
           "d.id NOT IN (SELECT a.doctor.id FROM Appointment a WHERE " +
           "a.appointmentTime = :timeSlot AND a.status != 'CANCELLED')")
    List<Doctor> findAvailableDoctorsBySpecialtyAndTime(
        @Param("specialty") String specialty,
        @Param("timeSlot") String timeSlot
    );
}
