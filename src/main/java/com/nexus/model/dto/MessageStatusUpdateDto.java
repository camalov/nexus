package com.nexus.model.dto;

import com.nexus.model.entity.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageStatusUpdateDto {
    private Long messageId;
    private MessageStatus status;
}
