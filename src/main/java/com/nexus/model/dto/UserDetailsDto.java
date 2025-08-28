package com.nexus.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsDto {
    private Long id;
    private String username;
    private Set<String> roles;
    private String lastLoginIp;
    private String deviceDetails;
    private LocalDateTime lastLoginTimestamp;
}
