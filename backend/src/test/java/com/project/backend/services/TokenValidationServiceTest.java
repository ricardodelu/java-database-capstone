package com.project.backend.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Map;

@SpringBootTest
public class TokenValidationServiceTest {

    @Autowired
    private TokenValidationService tokenValidationService;

    @Test
    void testTokenValidation() {
        // Generate token
        String token = tokenValidationService.generateToken("user123", "admin");
        
        // Validate token
        Map<String, String> result = tokenValidationService.validateToken(token, "admin");
        assertTrue(result.isEmpty());
        
        // Validate wrong role
        result = tokenValidationService.validateToken(token, "doctor");
        assertFalse(result.isEmpty());
        assertEquals("Invalid role for this resource", result.get("error"));
    }
}