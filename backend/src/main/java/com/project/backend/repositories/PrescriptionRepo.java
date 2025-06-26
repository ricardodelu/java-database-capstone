package com.project.backend.repositories;

import com.project.backend.models.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionRepo extends MongoRepository<Prescription, String> {
    List<Prescription> findByPatientId(Long patientId);
    List<Prescription> findByDoctorId(Long doctorId);
    List<Prescription> findByPatientIdAndActive(Long patientId, boolean active);
    List<Prescription> findByDoctorIdAndActive(Long doctorId, boolean active);
    List<Prescription> findByDoctorIdAndPatientId(Long doctorId, Long patientId);
}
