package com.project.backend.models;

import org.springframework.data.mongodb.core.mapping.Document;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Document(collection = "prescriptions")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Prescription {

    @Id    
    private Long id;
    @NotNull
    @Size(min = 3, max = 100, message = "Patient name must be between 3 and 100 characters")
    private String patientName;
    @NotNull
    private Long appointmentId;
    @NotNull
    @Size(min = 3, max = 100, message = "Medication name must be between 3 and 100 characters")
    private String medication;
    @NotNull
    @Size(min = 3, max = 100, message = "Dosage must be between 3 and 100 characters")
    private String dosage;    
    @Size(max = 200, message = "DoctorNotes must be less than 200 characters")
    private String doctorNotes;
    
}
