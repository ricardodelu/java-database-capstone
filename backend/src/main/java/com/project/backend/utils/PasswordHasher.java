package com.project.backend.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt hashed passwords for test data.
 * This is a one-time use utility to hash plaintext passwords for the initial data setup.
 */
public class PasswordHasher {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Admin passwords
        System.out.println("-- Admin Passwords --");
        System.out.println("'admin123' -> " + encoder.encode("admin123"));
        System.out.println("'password' -> " + encoder.encode("password"));
        
        // Doctor passwords
        System.out.println("\n-- Doctor Passwords --");
        System.out.println("'pass12345' -> " + encoder.encode("pass12345"));
        System.out.println("'secure4567' -> " + encoder.encode("secure4567"));
        System.out.println("'leePass987' -> " + encoder.encode("leePass987"));
        System.out.println("'w!ls0nPwd' -> " + encoder.encode("w!ls0nPwd"));
        System.out.println("'brownie123' -> " + encoder.encode("brownie123"));
        System.out.println("'taylor321' -> " + encoder.encode("taylor321"));
        System.out.println("'whiteSecure1' -> " + encoder.encode("whiteSecure1"));
        System.out.println("'clarkPass456' -> " + encoder.encode("clarkPass456"));
        System.out.println("'davis789' -> " + encoder.encode("davis789"));
        System.out.println("'millertime!' -> " + encoder.encode("millertime!"));
        
        // Patient passwords
        System.out.println("\n-- Patient Passwords --");
        System.out.println("'passJane1' -> " + encoder.encode("passJane1"));
        System.out.println("'smithSecure' -> " + encoder.encode("smithSecure"));
        System.out.println("'emilyPass99' -> " + encoder.encode("emilyPass99"));
        System.out.println("'airmj23' -> " + encoder.encode("airmj23"));
        System.out.println("'moonshine12' -> " + encoder.encode("moonshine12"));
    }
}
