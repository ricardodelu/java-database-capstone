package com.project.app.security;

import com.project.app.security.dto.JwtResponse;
import com.project.app.security.dto.LoginRequest;
import org.springframework.security.core.userdetails.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String username = loginRequest != null ? loginRequest.getUsername() : "[null]";
        logger.info("=== AUTHENTICATION STARTED for user: {} ===", username);
        logger.debug("Authentication request details - Username: {}, Password: [PROTECTED]", username);
        
        try {
            // Log incoming request details
            logger.debug("Incoming login request - Username: {}, Password present: {}", 
                username, 
                loginRequest != null && loginRequest.getPassword() != null && !loginRequest.getPassword().isEmpty());
                
            if (loginRequest == null) {
                logger.error("Login request body is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Login request cannot be null"));
            }
            // Basic validation
            if (username == null || username.trim().isEmpty()) {
                logger.error("Authentication failed: Username is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Username cannot be empty"));
            }
            
            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                logger.error("Authentication failed: Password is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Password cannot be empty"));
            }
            
            // Create authentication token
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                username,
                loginRequest.getPassword()
            );
            
            logger.debug("Attempting authentication with authentication manager for user: {}", username);
            logger.debug("AuthenticationManager class: {}", authenticationManager.getClass().getName());
            logger.debug("AuthenticationToken class: {}", authenticationToken.getClass().getName());
            logger.debug("AuthenticationToken principal: {}", authenticationToken.getPrincipal());
            logger.debug("AuthenticationToken credentials: [PROTECTED]");
            
            // Attempt authentication
            logger.debug("Attempting to authenticate user: {}", username);
            Authentication authentication = null;
            try {
                authentication = authenticationManager.authenticate(authenticationToken);
                logger.info("Authentication successful for user: {}", username);
            } catch (Exception e) {
                logger.error("Authentication failed for user: {}", username, e);
                String errorMessage = "Authentication failed: " + e.getMessage();
                if (e.getCause() != null) {
                    errorMessage += " - " + e.getCause().getMessage();
                }
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", errorMessage));
            }
            
            // Log authentication details
            if (authentication == null) {
                logger.warn("Authentication succeeded but returned null authentication object");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication service returned invalid response"));
            }
            
            logger.debug("Authentication details - Name: {}, Principal: {}, Authorities: {}", 
                authentication.getName(), 
                authentication.getPrincipal(), 
                authentication.getAuthorities());
            
            // Set security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Generate JWT token
            logger.debug("Generating JWT token for user: {}", username);
            String jwt;
            try {
                jwt = tokenProvider.generateToken(authentication);
                logger.debug("Successfully generated JWT token for user: {}", username);
            } catch (Exception e) {
                logger.error("Failed to generate JWT token for user: {}", username, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate authentication token"));
            }
            
            // Get user roles
            List<String> roles;
            try {
                roles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
                logger.debug("User {} has roles: {}", username, roles);
            } catch (Exception e) {
                logger.error("Failed to extract authorities for user: {}", username, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process user roles"));
            }
            
            logger.info("=== AUTHENTICATION SUCCESSFUL for user: {}, roles: {} ===", username, roles);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("username", authentication.getName());
            response.put("roles", roles);
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            logger.error("Authentication failed - Bad credentials for user: {}", username, e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid username or password"));
                
        } catch (DisabledException e) {
            logger.error("Authentication failed - User account is disabled: {}", username, e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "User account is disabled"));
                
        } catch (LockedException e) {
            logger.error("Authentication failed - User account is locked: {}", username, e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "User account is locked"));
                
        } catch (Exception e) {
            logger.error("Unexpected error during authentication for user: {}", username, e);
            
            // Log the full stack trace for debugging
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            logger.error("Stack trace: {}", sw.toString());
            
            // Handle nested exceptions
            Throwable cause = e;
            int level = 1;
            while (cause.getCause() != null && cause.getCause() != cause && level < 5) {
                cause = cause.getCause();
                logger.error("Nested cause ({}): {} - {}", level, cause.getClass().getName(), cause.getMessage());
                level++;
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Authentication failed",
                    "details", cause.getMessage() != null ? cause.getMessage() : "Unknown error"
                ));
        }
    }
}
