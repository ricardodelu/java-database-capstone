package com.project.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.models.Appointment;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepo extends JpaRepository<Appointment, Long> {

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor d " +
           "WHERE a.doctorId = :doctorId AND a.appointmentTime BETWEEN :start AND :end")
    List<Appointment> findByDoctorIdAndAppointmentTimeBetween(
        Long doctorId, 
        LocalDateTime start, 
        LocalDateTime end
    );

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient p LEFT JOIN FETCH a.doctor d " +
           "WHERE a.doctorId = :doctorId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :patientName, '%')) " +
           "AND a.appointmentTime BETWEEN :start AND :end")
    List<Appointment> findByDoctorIdAndPatientNameAndTimeRange(
        Long doctorId, 
        String patientName, 
        LocalDateTime start, 
        LocalDateTime end
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM Appointment a WHERE a.doctorId = :doctorId")
    void deleteAllByDoctorId(Long doctorId);

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByPatientIdAndStatusOrderByAppointmentTimeAsc(
        Long patientId, 
        String status
    );

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor d " +
           "WHERE a.patientId = :patientId AND LOWER(d.name) LIKE LOWER(CONCAT('%', :doctorName, '%'))")
    List<Appointment> filterByDoctorNameAndPatientId(
        String doctorName, 
        Long patientId
    );

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor d " +
           "WHERE a.patientId = :patientId AND LOWER(d.name) LIKE LOWER(CONCAT('%', :doctorName, '%')) " +
           "AND a.status = :status")
    List<Appointment> filterByDoctorNameAndPatientIdAndStatus(
        String doctorName, 
        Long patientId, 
        String status
    );

    boolean existsByDoctorIdAndAppointmentTimeAndStatusNot(
        Long doctorId, 
        LocalDateTime appointmentTime, 
        String status
    );

    @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
           "WHERE a.doctorId = :doctorId AND a.appointmentTime = :time AND a.status != 'CANCELLED'")
    boolean isTimeSlotBooked(Long doctorId, LocalDateTime time);
}
