package com.project.backend.repositories;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import com.project.backend.models.Doctor;

@DataJpaTest
class DoctorRepoTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DoctorRepo doctorRepo;

    @Test
    void whenFindByEmail_thenReturnDoctor() {
        // Arrange
        Doctor doctor = new Doctor();
        doctor.setName("Dr. Smith");
        doctor.setEmail("smith@example.com");
        doctor.setSpecialty("Cardiology");
        entityManager.persist(doctor);
        entityManager.flush();

        // Act
        Doctor found = doctorRepo.findByEmail("smith@example.com").orElse(null);

        // Assert
        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo(doctor.getEmail());
    }

    @Test
    void whenFindByNameLike_thenReturnMatchingDoctors() {
        // Arrange
        Doctor doctor1 = new Doctor();
        doctor1.setName("Dr. Smith");
        doctor1.setSpecialty("Cardiology");
        
        Doctor doctor2 = new Doctor();
        doctor2.setName("Dr. Smithson");
        doctor2.setSpecialty("Neurology");
        
        entityManager.persist(doctor1);
        entityManager.persist(doctor2);
        entityManager.flush();

        // Act
        List<Doctor> found = doctorRepo.findByNameLike("Smith");

        // Assert
        assertThat(found).hasSize(2);
        assertThat(found).extracting(Doctor::getName)
                        .containsExactlyInAnyOrder("Dr. Smith", "Dr. Smithson");
    }
}