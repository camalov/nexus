package com.nexus.controller;

import com.nexus.mapper.MessageMapper;
import com.nexus.model.dto.ChatMessageDto;
import com.nexus.model.dto.MessageStatusUpdateDto;
import com.nexus.model.dto.TypingStatusDto;
import com.nexus.model.entity.Message;
import com.nexus.model.entity.MessageStatus;
import com.nexus.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final MessageMapper messageMapper;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto) {
        Message savedMessage = messageService.saveMessage(chatMessageDto);

        // Convert the saved message entity back to a DTO to ensure all fields are correct
        ChatMessageDto messageToSend = messageMapper.messageToChatMessageDto(savedMessage);
        messageToSend.setTempId(chatMessageDto.getTempId());

        // Send the message to the recipient
        messagingTemplate.convertAndSendToUser(
                savedMessage.getRecipient().getUsername(),
                "/queue/messages",
                messageToSend
        );

        // Also send the message back to the sender for real-time UI update
        messagingTemplate.convertAndSendToUser(
                savedMessage.getSender().getUsername(),
                "/queue/messages",
                messageToSend
        );
    }

    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload MessageStatusUpdateDto statusUpdate) {
        messageService.updateStatus(statusUpdate.getMessageId(), MessageStatus.READ);
        // Notify the sender
        Message message = messageService.getMessageById(statusUpdate.getMessageId());
        messagingTemplate.convertAndSendToUser(
                message.getSender().getUsername(),
                "/queue/status",
                new MessageStatusUpdateDto(statusUpdate.getMessageId(), MessageStatus.READ)
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingStatusDto typingStatusDto) {
        messagingTemplate.convertAndSendToUser(
                typingStatusDto.getToUsername(),
                "/queue/status",
                typingStatusDto
        );
    }
}
