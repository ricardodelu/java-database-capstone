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
            logger.info("JWT token found: {}", jwt != null ? "[HIDDEN]" : "Not found");
            
            if (StringUtils.hasText(jwt)) {
                logger.debug("JWT token length: {} characters", jwt.length());
                logger.debug("JWT token prefix: {}", jwt.substring(0, Math.min(10, jwt.length())) + (jwt.length() > 10 ? "..." : ""));
                
                try {
                    if (tokenProvider.validateToken(jwt)) {
                        logger.debug("JWT token validation succeeded");
                        String username = tokenProvider.getUsernameFromJWT(jwt);
                        logger.info("Extracted username from JWT: {}", username);
                        
                        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                        logger.info("Loaded user details for: {}, roles: {}", 
                            username, userDetails.getAuthorities());
                        
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                userDetails, 
                                null, 
                                userDetails.getAuthorities()
                            );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.info("Successfully set authentication in SecurityContext for user: {}", username);
                    } else {
                        logger.warn("JWT token validation failed");
                        logger.debug("Token validation failed for token: {}", jwt);
                    }
                } catch (Exception e) {
                    logger.error("Error during JWT validation: {}", e.getMessage(), e);
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
