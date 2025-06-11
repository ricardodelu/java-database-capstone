package com.project.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient cannot be null")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor cannot be null")
    private Doctor doctor;

    @NotNull(message = "Medication cannot be null")
    @Size(min = 3, max = 500, message = "Medication must be between 3 and 500 characters")
    private String medication;

    @NotNull(message = "Dosage cannot be null")
    @Size(min = 3, max = 200, message = "Dosage must be between 3 and 200 characters")
    private String dosage;

    @NotNull(message = "Duration cannot be null")
    @Size(max = 100, message = "Duration must be less than 100 characters")
    private String duration;

    @Size(max = 1000, message = "Notes must be less than 1000 characters")
    private String notes;

    private LocalDateTime prescribedAt;

    private boolean active = true;

    private String status;

    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Lifecycle callbacks
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (prescribedAt == null) {
            prescribedAt = now;
        }
    }
}
