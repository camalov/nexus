package com.nexus.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingStatusDto {
    private String fromUsername;
    private String toUsername;
    private boolean isTyping;
}
