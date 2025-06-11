package com.project.backend.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {
    private Long id;
    
    @NotNull(message = "Patient ID cannot be null")
    private Long patientId;
    
    @NotNull(message = "Doctor ID cannot be null")
    private Long doctorId;
    
    @NotNull(message = "Medication cannot be null")
    @Size(max = 500, message = "Medication details must be less than 500 characters")
    private String medication;
    
    @NotNull(message = "Dosage cannot be null")
    @Size(max = 200, message = "Dosage instructions must be less than 200 characters")
    private String dosage;
    
    @NotNull(message = "Duration cannot be null")
    @Size(max = 100, message = "Duration must be less than 100 characters")
    private String duration;
    
    @Size(max = 1000, message = "Notes must be less than 1000 characters")
    private String notes;
    
    private LocalDateTime prescribedAt;
    
    // Optional fields for response
    private String patientName;
    private String doctorName;
} 