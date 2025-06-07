package com.project.backend.dtos;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;

class AppointmentDTOTest {

    @Test
    void testDerivedFields() {
        // Arrange
        LocalDateTime appointmentTime = LocalDateTime.of(2025, 6, 1, 14, 30);
        AppointmentDTO dto = new AppointmentDTO(
            1L, 1L, "Dr. Smith",
            1L, "John Doe",
            "john@example.com", "1234567890",
            "123 Main St", appointmentTime,
            "SCHEDULED"
        );

        // Assert
        assertEquals(appointmentTime.toLocalDate(), dto.getAppointmentDate());
        assertEquals(appointmentTime.toLocalTime(), dto.getAppointmentTimeOnly());
        assertEquals(appointmentTime.plusHours(1), dto.getEndTime());
    }

    @Test
    void testSetAppointmentTimeUpdatesDerivedFields() {
        // Arrange
        AppointmentDTO dto = new AppointmentDTO();
        LocalDateTime newTime = LocalDateTime.of(2025, 6, 1, 15, 30);

        // Act
        dto.setAppointmentTime(newTime);

        // Assert
        assertEquals(newTime.toLocalDate(), dto.getAppointmentDate());
        assertEquals(newTime.toLocalTime(), dto.getAppointmentTimeOnly());
        assertEquals(newTime.plusHours(1), dto.getEndTime());
    }
}