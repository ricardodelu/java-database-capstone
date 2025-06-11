package com.project.backend.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.io.Decoders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TokenValidationService {
    
    private static final Logger logger = LoggerFactory.getLogger(TokenValidationService.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    private Key getSigningKey() {
        try {
            // Log injected jwtSecret (masked) and generated signing key (as a string) for debugging.
            String maskedSecret = (jwtSecret != null) ? (jwtSecret.substring(0, Math.min(5, jwtSecret.length())) + "..." + (jwtSecret.length() > 10 ? jwtSecret.substring(jwtSecret.length() - 5) : "")) : "null";
            System.err.println("TokenValidationService.getSigningKey: injected jwtSecret (masked) is: " + maskedSecret + " (length: " + (jwtSecret != null ? jwtSecret.length() : 0) + ")");
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            Key signingKey = Keys.hmacShaKeyFor(keyBytes);
            System.err.println("TokenValidationService.getSigningKey: generated signing key (as string) is: " + (signingKey != null ? signingKey.toString() : "null"));
            return signingKey;
        } catch (Exception e) {
            System.err.println("TokenValidationService.getSigningKey caught an exception:");
            e.printStackTrace(System.err);
            throw e; // re-throw for further logging
        }
    }

    public Map<String, String> validateToken(String token, String requiredRole) {
        Map<String, String> result = new HashMap<>();
        
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Check if token is expired
            if (claims.getExpiration().before(new Date())) {
                result.put("error", "Token has expired");
                return result;
            }

            // Verify role
            String userRole = claims.get("role", String.class);
            if (!requiredRole.equals(userRole)) {
                result.put("error", "Invalid role for this resource");
                return result;
            }

            return result; // Empty map means validation passed

        } catch (Exception e) {
            result.put("error", "Invalid token: " + e.getMessage());
            return result;
        }
    }

    public String generateToken(String email, String role) {
        try {
            // Log (masked) email and signing key (as a string) for debugging.
            String maskedEmail = (email != null) ? (email.substring(0, Math.min(5, email.length())) + "..." + (email.length() > 10 ? email.substring(email.length() - 5) : "")) : "null";
            System.err.println("TokenValidationService.generateToken: masked email is: " + maskedEmail + " (length: " + (email != null ? email.length() : 0) + ")");
            System.err.println("TokenValidationService.generateToken: signing key (as a string) is: " + (getSigningKey() != null ? getSigningKey().toString() : "null"));
            String token = Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
            String maskedToken = (token != null) ? (token.substring(0, Math.min(5, token.length())) + "..." + (token.length() > 10 ? token.substring(token.length() - 5) : "")) : "null";
            System.err.println("TokenValidationService.generateToken: generated token (masked) is: " + maskedToken + " (length: " + (token != null ? token.length() : 0) + ")");
            return token;
        } catch (Exception e) {
            System.err.println("TokenValidationService.generateToken caught an exception:");
            e.printStackTrace(System.err);
            throw e; // re-throw for further logging
        }
    }

    public String extractUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public String extractEmailFromToken(String token) {
        try {
            // Log (masked) token and signing key (as a string) for debugging.
            String maskedToken = (token != null) ? (token.substring(0, Math.min(5, token.length())) + "..." + (token.length() > 10 ? token.substring(token.length() - 5) : "")) : "null";
            System.err.println("TokenValidationService.extractEmailFromToken: masked token (masked) is: " + maskedToken + " (length: " + (token != null ? token.length() : 0) + ")");
            System.err.println("TokenValidationService.extractEmailFromToken: signing key (as a string) is: " + (getSigningKey() != null ? getSigningKey().toString() : "null"));
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
            String subject = claims.getSubject();
            String maskedSubject = (subject != null) ? (subject.substring(0, Math.min(5, subject.length())) + "..." + (subject.length() > 10 ? subject.substring(subject.length() - 5) : "")) : "null";
            System.err.println("TokenValidationService.extractEmailFromToken: (masked) subject (email) is: " + maskedSubject + " (length: " + (subject != null ? subject.length() : 0) + ")");
            return subject;
        } catch (Exception e) {
            System.err.println("TokenValidationService.extractEmailFromToken caught an exception:");
            e.printStackTrace(System.err);
            throw e; // re-throw so that the caller (e.g. AppService) can log it as well
        }
    }

    public String extractRoleFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
            return claims.get("role", String.class);
        } catch (Exception e) {
            logger.error("Failed to extract role from token: {}", e.getMessage());
            return null;
        }
    }
}
