package com.project.app.dtos;

public class LoginDTO {
    private String email;
    private String password;

    // Default constructor
    public LoginDTO() {}

    // Constructor with fields
    public LoginDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters and setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
