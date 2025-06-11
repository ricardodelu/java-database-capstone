package com.project.backend.repositories;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import static org.assertj.core.api.Assertions.assertThat;
import com.project.backend.models.Patient;

@DataJpaTest
class PatientRepoTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PatientRepo patientRepo;

    @Test
    void whenFindByEmail_thenReturnPatient() {
        // Arrange
        Patient patient = new Patient();
        patient.setName("John Doe");
        patient.setEmail("john@example.com");
        patient.setPhoneNumber("1234567890");
        entityManager.persist(patient);
        entityManager.flush();

        // Act
        Patient found = patientRepo.findByEmail("john@example.com").orElse(null);

        // Assert
        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo(patient.getEmail());
    }

    @Test
    void whenFindByEmailOrPhoneNumber_thenReturnPatient() {
        // Arrange
        Patient patient = new Patient();
        patient.setName("Jane Doe");
        patient.setEmail("jane@example.com");
        patient.setPhoneNumber("0987654321");
        entityManager.persist(patient);
        entityManager.flush();

        // Act
        Patient foundByEmail = patientRepo.findByEmailOrPhoneNumber("jane@example.com", null).orElse(null);
        Patient foundByPhone = patientRepo.findByEmailOrPhoneNumber(null, "0987654321").orElse(null);

        // Assert
        assertThat(foundByEmail).isNotNull();
        assertThat(foundByPhone).isNotNull();
        assertThat(foundByEmail.getId()).isEqualTo(foundByPhone.getId());
    }
}