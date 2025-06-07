package com.project.backend.repositories;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import static org.assertj.core.api.Assertions.assertThat;
import com.project.backend.models.Admin;

@DataJpaTest
class AdminRepoTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AdminRepo adminRepo;

    @Test
    void whenFindByUsername_thenReturnAdmin() {
        // Arrange
        Admin admin = new Admin();
        admin.setUsername("testadmin");
        admin.setPassword("password123");
        entityManager.persist(admin);
        entityManager.flush();

        // Act
        Admin found = adminRepo.findByUsername("testadmin").orElse(null);

        // Assert
        assertThat(found).isNotNull();
        assertThat(found.getUsername()).isEqualTo(admin.getUsername());
    }

    @Test
    void whenExistsByUsername_thenReturnTrue() {
        // Arrange
        Admin admin = new Admin();
        admin.setUsername("existingadmin");
        admin.setPassword("password123");
        entityManager.persist(admin);
        entityManager.flush();

        // Act & Assert
        assertThat(adminRepo.existsByUsername("existingadmin")).isTrue();
        assertThat(adminRepo.existsByUsername("nonexistent")).isFalse();
    }
}