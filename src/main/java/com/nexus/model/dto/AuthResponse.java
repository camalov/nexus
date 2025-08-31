package com.nexus.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String username;
    private String token;
    private Set<String> roles;
}
