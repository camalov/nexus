package com.nexus.controller;

import com.nexus.mapper.MessageMapper;
import com.nexus.model.dto.ChatMessageDto;
import com.nexus.model.entity.Message;
import com.nexus.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageMapper messageMapper;

    @GetMapping("/{senderId}/{recipientId}")
    public ResponseEntity<Page<ChatMessageDto>> getMessageHistory(
            @PathVariable Long senderId,
            @PathVariable Long recipientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<ChatMessageDto> messages = messageService.getMessageHistory(senderId, recipientId, pageable);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        Message deletedMessage = messageService.softDeleteMessage(messageId);
        ChatMessageDto messageDto = messageMapper.messageToChatMessageDto(deletedMessage);

        // Broadcast the deleted message update to both users
        messagingTemplate.convertAndSendToUser(
                deletedMessage.getSender().getUsername(),
                "/queue/messages",
                messageDto
        );
        messagingTemplate.convertAndSendToUser(
                deletedMessage.getRecipient().getUsername(),
                "/queue/messages",
                messageDto
        );
        return ResponseEntity.ok().build();
    }
}
