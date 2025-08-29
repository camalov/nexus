package com.nexus.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    // Add these two new fields
    private Long id;
    private String username;

    private String token;
}
