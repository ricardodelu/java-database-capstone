package com.project.backend.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.project.backend.repositories.AdminRepo;
import com.project.backend.models.Admin;
import java.util.Map;
import java.util.Optional;

@SpringBootTest
public class ServiceTest {

    @Autowired
    private AppService appService;

    @MockBean
    private AdminRepo adminRepository;

    @Test
    void validateAdminWithValidCredentials() {
        Map<String, String> credentials = Map.of(
            "username", "admin",
            "password", "admin@1234"
        );

        Admin admin = new Admin();
        admin.setUsername("admin");
        admin.setPassword("admin@1234");

        when(adminRepository.findByUsername("admin"))
            .thenReturn(Optional.of(admin));

        ResponseEntity<?> response = appService.validateAdmin(credentials);
        assertTrue(response.getStatusCode().is2xxSuccessful());
    }
}