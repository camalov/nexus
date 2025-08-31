package com.nexus.model.dto;

import com.nexus.model.entity.MessageStatus;
import com.nexus.model.entity.MessageType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageDto {
    private Long id;
    private String tempId;
    private String senderUsername;
    private String recipientUsername;
    private String content;
    private MessageType type;
    private MessageStatus status;
    private LocalDateTime timestamp; // Added for media management view
    private boolean ephemeral = false;
    private boolean deleted = false; // Added for soft delete
}
