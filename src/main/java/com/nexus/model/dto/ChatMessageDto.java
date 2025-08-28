package com.nexus.model.dto;

import com.nexus.model.entity.MessageType;
import lombok.Data;

@Data
public class ChatMessageDto {
    private String senderUsername;
    private String recipientUsername;
    private String content;
    private MessageType type;
}
