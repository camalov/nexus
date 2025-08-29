package com.nexus.controller;

import com.nexus.model.dto.ChatMessageDto;
import com.nexus.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessageDto>> getMessageHistory(
            @PathVariable Long senderId,
            @PathVariable Long recipientId) {
        List<ChatMessageDto> messages = messageService.getMessageHistory(senderId, recipientId);
        return ResponseEntity.ok(messages);
    }
}
