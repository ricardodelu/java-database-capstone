package com.project.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private CustomUserDetailsService customUserDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        final String requestUri = request.getRequestURI();
        logger.info("=== JWT FILTER START: {} {} ===", request.getMethod(), requestUri);
        
        try {
            // Log all request headers for debugging
            logger.debug("Request headers:");
            java.util.Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                logger.debug("  {}: {}", headerName, request.getHeader(headerName));
            }
            
            String jwt = getJwtFromRequest(request);
            logger.debug("JWT token from request: {}", jwt != null ? "[HIDDEN]" : "null");
            
            if (jwt == null) {
                logger.warn("No JWT token found in request headers");
            }
            logger.info("JWT token found: {}", jwt != null ? "[HIDDEN]" : "Not found");
            
            if (StringUtils.hasText(jwt)) {
                logger.debug("JWT token length: {} characters", jwt.length());
                logger.debug("JWT token prefix: {}", jwt.substring(0, Math.min(10, jwt.length())) + (jwt.length() > 10 ? "..." : ""));
                
                try {
                    if (StringUtils.hasText(jwt)) {
                        logger.debug("JWT token found, validating...");
                        boolean isValid = tokenProvider.validateToken(jwt);
                        logger.debug("JWT token validation result: {}", isValid);
                        
                        if (isValid) {
                            logger.debug("JWT token validation succeeded");
                            String username = tokenProvider.getUsernameFromJWT(jwt);
                            logger.info("Extracted username from JWT: {}", username);
                            
                            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                            logger.debug("Loaded user details: {}", userDetails.getUsername());
                            logger.debug("User authorities: {}", userDetails.getAuthorities());
                            
                            // Get authorities from the token
                            Claims claims = tokenProvider.getClaimsFromToken(jwt);
                            String authoritiesString = claims.get("auth", String.class);
                            logger.info("Authorities from token: {}", authoritiesString);
                            
                            // Convert authorities string to a list of GrantedAuthority
                            List<GrantedAuthority> authorities = new ArrayList<>();
                            if (authoritiesString != null && !authoritiesString.isEmpty()) {
                                String[] roles = authoritiesString.split(",");
                                for (String role : roles) {
                                    // Ensure role has the ROLE_ prefix
                                    String roleName = role.trim().startsWith("ROLE_") ? role.trim() : "ROLE_" + role.trim();
                                    authorities.add(new SimpleGrantedAuthority(roleName));
                                    logger.debug("Added authority: {}", roleName);
                                }
                            }
                            // Create authentication token
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, authorities);
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            
                            // Set the authentication in the SecurityContext
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            logger.info("Authenticated user: {}", username);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Could not set user authentication in security context", e);
                    throw e;
                }
            } else {
                logger.warn("No JWT token found in request headers");
                StringBuilder headers = new StringBuilder();
                java.util.Enumeration<String> headersEnum = request.getHeaderNames();
                while (headersEnum.hasMoreElements()) {
                    String h = headersEnum.nextElement();
                    if (headers.length() > 0) headers.append(", ");
                    headers.append(h).append(": ").append(request.getHeader(h));
                }
                logger.debug("Available headers: {}", headers);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        // Skip JWT filter for authentication endpoints
        return path.startsWith("/api/auth/");
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
