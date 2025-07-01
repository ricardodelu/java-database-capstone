package com.project.backend.security;

import com.project.backend.security.dto.JwtResponse;
import com.project.backend.security.dto.LoginRequest;
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
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                username,
                loginRequest.getPassword()
            );
            
            logger.debug("Attempting authentication with authentication manager for user: {}", username);
            Authentication authentication = null;
            try {
                authentication = authenticationManager.authenticate(authenticationToken);
                logger.debug("Authentication successful for user: {}", username);
            } catch (Exception e) {
                logger.error("Authentication failed for user: {}", username, e);
                throw e;
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
