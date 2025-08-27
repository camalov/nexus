package com.nexus.controller;

import com.nexus.model.dto.ChatMessageDto;
import com.nexus.model.entity.Message;
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

    @MessageMapping("/chat/message")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto) {
        Message savedMessage = messageService.saveMessage(chatMessageDto);

        // Send to recipient's private queue
        messagingTemplate.convertAndSendToUser(
                savedMessage.getRecipient().getUsername(),
                "/queue/messages",
                chatMessageDto
        );
    }
}
