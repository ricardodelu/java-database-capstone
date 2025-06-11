package com.project.backend.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private Long id;
    
    @NotNull(message = "Name cannot be null")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;
    
    @NotNull(message = "Email cannot be null")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotNull(message = "Phone number cannot be null")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;
    
    @NotNull(message = "Specialization cannot be null")
    @Size(max = 100, message = "Specialization must be less than 100 characters")
    private String specialization;
    
    @NotNull(message = "License number cannot be null")
    @Size(min = 5, max = 20, message = "License number must be between 5 and 20 characters")
    private String licenseNumber;
    
    // For registration
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
} 