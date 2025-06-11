package com.project.backend.models;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import java.time.LocalDateTime;

class PrescriptionTest {

    @Test
    void prePersistSetsTimestamps() {
        // Arrange
        Prescription prescription = new Prescription();

        // Act
        prescription.prePersist();

        // Assert
        assertThat(prescription.getCreatedAt()).isNotNull();
        assertThat(prescription.getUpdatedAt()).isNotNull();
        assertThat(prescription.getPrescribedAt()).isNotNull();
    }
}