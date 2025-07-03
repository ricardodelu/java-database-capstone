package com.project.app.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${APP_JWT_SECRET:your-secret-key-change-this-in-production}")
    private String jwtSecret;

    @Value("${APP_JWT_EXPIRATION_MS:86400000}")
    private int jwtExpirationMs;

    private boolean isBase64(String value) {
        try {
            Base64.getDecoder().decode(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private SecretKey getSigningKey() {
        try {
            // If the secret is already base64 encoded, decode it first
            byte[] keyBytes = isBase64(jwtSecret) 
                ? Base64.getDecoder().decode(jwtSecret)
                : jwtSecret.getBytes();
                
            // Ensure the key is at least 32 bytes for HS512
            if (keyBytes.length < 32) {
                byte[] paddedKey = new byte[32];
                System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
                keyBytes = paddedKey;
            }
            
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            logger.error("Error creating signing key: {}", e.getMessage());
            throw new RuntimeException("Failed to create JWT signing key", e);
        }
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("auth", authorities)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String authToken) {
        logger.debug("Validating JWT token");
        try {
            logger.debug("Token to validate: {}", authToken.substring(0, Math.min(20, authToken.length())) + "...");
            
            // First check if token is well-formed
            String[] parts = authToken.split("\\.");
            if (parts.length != 3) {
                logger.error("Invalid JWT token format: expected 3 parts, got {}", parts.length);
                return false;
            }
            
            // Parse and validate the token
            Claims claims = Jwts.parser()
                .verifyWith((SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(authToken)
                .getPayload();
                
            // Check expiration
            Date expiration = claims.getExpiration();
            if (expiration != null && expiration.before(new Date())) {
                logger.error("JWT token is expired: {}", expiration);
                return false;
            }
            
            // Check issued at
            Date issuedAt = claims.getIssuedAt();
            if (issuedAt != null && issuedAt.after(new Date())) {
                logger.error("JWT token issued in the future: {}", issuedAt);
                return false;
            }
            
            logger.debug("JWT token validation successful");
            logger.debug("Token subject: {}", claims.getSubject());
            logger.debug("Token issued at: {}", issuedAt);
            logger.debug("Token expires at: {}", expiration);
            
            return true;
            
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during JWT validation: {}", e.getMessage(), e);
        }
        return false;
    }
}
