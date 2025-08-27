package com.nexus.model.dto;

import lombok.Data;

@Data
public class ChatMessageDto {
    private String senderUsername;
    private String recipientUsername;
    private String content;
}
