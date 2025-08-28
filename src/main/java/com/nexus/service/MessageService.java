package com.nexus.service;

import com.nexus.model.dto.ChatMessageDto;
import com.nexus.model.entity.Message;
import com.nexus.model.entity.User;
import com.nexus.repository.MessageRepository;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public Message saveMessage(ChatMessageDto chatMessageDto) {
        User sender = userRepository.findByUsername(chatMessageDto.getSenderUsername())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User recipient = userRepository.findByUsername(chatMessageDto.getRecipientUsername())
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(chatMessageDto.getContent());
        message.setTimestamp(LocalDateTime.now());

        return messageRepository.save(message);
    }
}
