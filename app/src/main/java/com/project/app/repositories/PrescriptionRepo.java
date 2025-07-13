package com.project.app.repositories;

import com.project.app.models.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepo extends MongoRepository<Prescription, String> {
    List<Prescription> findByPatientId(Long patientId);
    List<Prescription> findByDoctorId(Long doctorId);
    List<Prescription> findByPatientIdAndActive(Long patientId, boolean active);
    List<Prescription> findByDoctorIdAndActive(Long doctorId, boolean active);
    List<Prescription> findByDoctorIdAndPatientId(Long doctorId, Long patientId);
    List<Prescription> findByAppointmentId(Long appointmentId);
    Optional<Prescription> findFirstByAppointmentId(Long appointmentId);
}
