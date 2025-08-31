package com.nexus.controller;

import com.nexus.model.dto.ChatMessageDto;
import com.nexus.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

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
}
