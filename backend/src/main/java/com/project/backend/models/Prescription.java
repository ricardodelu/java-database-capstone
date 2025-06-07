package com.project.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Document(collection = "prescriptions")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Prescription {

    @Id    
    private String id;

    @Indexed
    @NotNull
    private String appointmentId;

    @Indexed
    @NotNull
    private String patientId;

    @NotNull
    private String doctorId;

    @NotNull
    @Size(min = 3, max = 100)
    private String patientName;

    @NotNull
    @Size(min = 3, max = 100)
    private String medication;

    @NotNull
    @Size(min = 3, max = 100)
    private String dosage;    

    @Size(max = 200)
    private String doctorNotes;

    private LocalDateTime date;

    private boolean active = true;

    // Added indexes for common queries
    @Indexed
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
        if (date == null) {
            date = now;
        }
    }
}
