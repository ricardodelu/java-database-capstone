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
        String username = loginRequest.getUsername();
        logger.info("=== AUTHENTICATION STARTED for user: {} ===", username);
        logger.debug("Authentication request details - Username: {}, Password: [PROTECTED]", username);
        
        try {
            logger.debug("Creating authentication token for user: {}", username);
            
            // Log the request details
            logger.debug("LoginRequest: username={}, password=[PROTECTED]", loginRequest.getUsername());
            
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
            
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                username,
                loginRequest.getPassword()
            );
            
            logger.debug("Attempting authentication with authentication manager for user: {}", username);
            logger.debug("AuthenticationManager class: {}", authenticationManager.getClass().getName());
            logger.debug("AuthenticationToken class: {}", authenticationToken.getClass().getName());
            logger.debug("AuthenticationToken principal: {}", authenticationToken.getPrincipal());
            logger.debug("AuthenticationToken credentials: [PROTECTED]");
            logger.debug("AuthenticationToken authorities: {}", authenticationToken.getAuthorities());
            
            Authentication authentication = null;
            try {
                logger.debug("Before authenticationManager.authenticate()");
                
                if (authenticationManager == null) {
                    logger.error("AuthenticationManager is not autowired properly");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Authentication service not available"));
                }
                
                // Log the authentication manager details
                logger.debug("AuthenticationManager details: {}", authenticationManager);
                
                // Attempt authentication
                authentication = authenticationManager.authenticate(authenticationToken);
                logger.info("Authentication successful for user: {}", username);
                
                // Log authentication details
                if (authentication != null) {
                    logger.debug("Authentication details - Name: {}, Principal: {}, Authorities: {}", 
                        authentication.getName(), 
                        authentication.getPrincipal(), 
                        authentication.getAuthorities());
                } else {
                    logger.warn("Authentication succeeded but returned null authentication object");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Authentication service returned invalid response"));
                }
                
            } catch (Exception e) {
                logger.error("Authentication failed for user: {}", username, e);
                logger.error("Authentication failure details:", e);
                logger.error("Exception type: {}", e.getClass().getName());
                logger.error("Exception message: {}", e.getMessage());
                
                // Log the full stack trace for debugging
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                logger.error("Full stack trace: {}", sw.toString());
                
                // Handle specific exceptions
                if (e instanceof BadCredentialsException) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid username or password"));
                } else if (e instanceof DisabledException) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User account is disabled"));
                } else if (e instanceof LockedException) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User account is locked"));
                } else if (e.getCause() != null) {
                    logger.error("Root cause: {}", e.getCause().getClass().getName());
                    logger.error("Root cause message: {}", e.getCause().getMessage());
                    
                    // Log nested causes if they exist
                    Throwable cause = e.getCause();
                    int level = 1;
                    while (cause.getCause() != null && cause.getCause() != cause && level < 5) {
                        cause = cause.getCause();
                        logger.error("Nested cause ({}): {} - {}", level, cause.getClass().getName(), cause.getMessage());
                        level++;
                    }
                    
                    // Return the root cause message
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                            "error", "Authentication failed",
                            "details", cause.getMessage()
                        ));
                }
                
                // Generic error response
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Authentication failed",
                        "details", e.getMessage()
                    ));
            }
            
            logger.debug("Authentication successful, setting security context");
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            logger.debug("Generating JWT token for user: {}", username);
            String jwt = tokenProvider.generateToken(authentication);
            
            // Get user roles
            List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
            
            logger.info("=== AUTHENTICATION SUCCESSFUL for user: {}, roles: {} ===", username, roles);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("username", authentication.getName());
            response.put("roles", roles);
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            logger.error("Authentication failed - Bad credentials for user: {}", username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication failed: Invalid username or password"));
                
        } catch (DisabledException e) {
            logger.error("Authentication failed - User account is disabled: {}", username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication failed: User account is disabled"));
                
        } catch (LockedException e) {
            logger.error("Authentication failed - User account is locked: {}", username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Authentication failed: User account is locked"));
                
        } catch (Exception e) {
            logger.error("Authentication failed for user: {}", username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }
}
