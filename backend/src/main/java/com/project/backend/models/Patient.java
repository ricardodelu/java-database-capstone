package com.project.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Patient {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    @NotNull(message = "Name cannot be null")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")    
    private String name;
    @NotNull
    @Email
    private String email;
    @NotNull
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @NotNull
    @Pattern(regexp = "\\d{10}")
    private String phoneNumber;
    @NotNull
    @Size(max = 255, message = "Address must be less than 255 characters")
    private String address;    

    
}
