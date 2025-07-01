package com.project.app.models;

import java.beans.Transient;
import java.sql.Date;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor cannot be null")
    @JsonIgnore
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient cannot be null")
    private Patient patient;

    @Future(message = "Appointment date must be in the future")
    private LocalDateTime appointmentTime;

    private String status;

    @Transient
    public Long getDoctorId() {
        return doctor != null ? doctor.getId() : null;
    }

    @Transient
    public Long getPatientId() {
        return patient != null ? patient.getId() : null;
    }

    @Transient
    public LocalDateTime getEndTime() {        
        return appointmentTime.plusMinutes(60);        
    }

    @Transient
    public Date getDate() {
        return Date.valueOf(appointmentTime.toLocalDate());
    }

    @Transient  
    public String getTime() {
        return appointmentTime.toLocalTime().toString();
    }

}

