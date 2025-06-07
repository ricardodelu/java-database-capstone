package com.project.backend.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.project.backend.models.Prescription;
import java.util.List;

@Repository
public interface PrescriptionRepo extends MongoRepository<Prescription, String> {
    
    /**
     * Find all prescriptions for a specific appointment
     * @param appointmentId the appointment ID to search for
     * @return List of prescriptions for the appointment
     */
    List<Prescription> findByAppointmentId(String appointmentId);
    
    /**
     * Find all prescriptions for a specific patient
     * @param patientId the patient ID to search for
     * @return List of prescriptions for the patient
     */
    List<Prescription> findByPatientIdOrderByDateDesc(String patientId);
    
    /**
     * Find active prescriptions for a patient
     * @param patientId the patient ID
     * @param active prescription status
     * @return List of active prescriptions
     */
    List<Prescription> findByPatientIdAndActive(String patientId, boolean active);
}
