package com.project.backend.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ServiceTest {

    @Autowired
    private Service service;

    @MockBean
    private AdminRepository adminRepository;

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

        ResponseEntity<?> response = service.validateAdmin(credentials);
        assertTrue(response.getStatusCode().is2xxSuccessful());
    }
}