package com.project.backend.repositories;

import com.project.backend.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepo extends JpaRepository<Appointment, Long> {
    // Basic CRUD operations
    List<Appointment> findByPatient_Id(Long patientId);
    List<Appointment> findByDoctor_Id(Long doctorId);
    List<Appointment> findByStatus(String status);
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentTime >= :start AND a.appointmentTime < :end")
    List<Appointment> findByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT a FROM Appointment a WHERE a.status = :status AND a.appointmentTime >= :start AND a.appointmentTime < :end")
    List<Appointment> findByStatusAndDate(@Param("status") String status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Time-based queries
    List<Appointment> findByPatient_IdAndAppointmentTimeBefore(Long patientId, LocalDateTime time);
    List<Appointment> findByPatient_IdAndAppointmentTimeAfter(Long patientId, LocalDateTime time);

    // Custom queries
    @Query("SELECT a FROM Appointment a WHERE a.doctor.name LIKE %:name% AND a.patient.id = :patientId")
    List<Appointment> filterByDoctorNameAndPatientId(String name, Long patientId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId AND a.appointmentTime = :appointmentTime")
    boolean isTimeSlotBooked(
        @Param("doctorId") Long doctorId,
        @Param("appointmentTime") LocalDateTime appointmentTime
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM Appointment a WHERE a.doctor.id = :doctorId")
    void deleteAllByDoctorId(Long doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentTime BETWEEN :start AND :end")
    List<Appointment> findByDoctorIdAndAppointmentTimeBetween(
        @Param("doctorId") Long doctorId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentTime > :now")
    List<Appointment> findByPatientIdAndAppointmentTimeAfter(
        @Param("patientId") Long patientId,
        @Param("now") LocalDateTime now
    );

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentTime BETWEEN :start AND :end")
    List<Appointment> findByPatientIdAndAppointmentTimeBetween(
        @Param("patientId") Long patientId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
