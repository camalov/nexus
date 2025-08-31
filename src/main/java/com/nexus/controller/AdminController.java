package com.nexus.controller;

import com.nexus.model.dto.ChatMessageDto;
import com.nexus.model.dto.UserDetailsDto;
import com.nexus.service.MessageService;
import com.nexus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final MessageService messageService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDetailsDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailsDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/media")
    public ResponseEntity<List<ChatMessageDto>> getMediaMessages(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(messageService.getMediaMessages(type));
    }

    @DeleteMapping("/media/{messageId}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long messageId) {
        try {
            messageService.hardDeleteMessage(messageId);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            // Log the exception and return an internal server error
            System.err.println("Failed to delete media file for message ID: " + messageId + "; " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
