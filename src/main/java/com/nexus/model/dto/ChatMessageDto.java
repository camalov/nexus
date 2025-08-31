package com.nexus.model.dto;

import com.nexus.model.entity.MessageStatus; // Add this import
import com.nexus.model.entity.MessageType;
import lombok.Data;

@Data
public class ChatMessageDto {
    private Long id; // Add this field
    private String tempId;
    private String senderUsername;
    private String recipientUsername;
    private String content;
    private MessageType type;
    private MessageStatus status; // Add this field
    private boolean ephemeral = false;
}
