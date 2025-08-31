package com.nexus.service;

import com.nexus.mapper.MessageMapper;
import com.nexus.model.dto.ChatMessageDto;
import com.nexus.model.entity.Message;
import com.nexus.model.entity.MessageStatus;
import com.nexus.model.entity.MessageType;
import com.nexus.model.entity.User;
import com.nexus.repository.MessageRepository;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final MessageMapper messageMapper = MessageMapper.INSTANCE;

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getMessageHistory(Long senderId, Long recipientId, Pageable pageable) {
        Page<Message> messages = messageRepository.findConversation(senderId, recipientId, pageable);
        return messages.map(messageMapper::messageToChatMessageDto);
    }

    @Transactional
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
        message.setType(chatMessageDto.getType());
        message.setStatus(MessageStatus.SENT);
        message.setDeleted(false);

        return messageRepository.save(message);
    }

    @Transactional
    public void updateStatus(Long messageId, MessageStatus status) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setStatus(status);
        messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public Message getMessageById(Long messageId) {
        return messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    @Transactional
    public void softDeleteMessage(Long messageId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + messageId));

        if (!message.getSender().getUsername().equals(currentUsername)) {
            throw new AccessDeniedException("User is not authorized to delete this message");
        }

        message.setDeleted(true);
        messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMediaMessages(String type) {
        List<MessageType> typesToFetch;
        if (type != null && !type.isEmpty()) {
            try {
                typesToFetch = Collections.singletonList(MessageType.valueOf(type.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return Collections.emptyList();
            }
        } else {
            typesToFetch = Arrays.asList(MessageType.IMAGE, MessageType.FILE);
        }

        List<Message> messages = messageRepository.findAllByTypeIn(typesToFetch);
        return messages.stream()
                .map(messageMapper::messageToChatMessageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void hardDeleteMessage(Long messageId) throws IOException {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + messageId));

        if (message.getType() == MessageType.IMAGE || message.getType() == MessageType.FILE) {
            String filePath = message.getContent();
            if (filePath != null && !filePath.isEmpty()) {
                String filename = filePath.substring(filePath.lastIndexOf("/") + 1);
                fileStorageService.delete(filename);
            }
        }

        message.setDeleted(true);
        message.setType(MessageType.TEXT);
        message.setContent("[media permanently deleted by admin]");
        messageRepository.save(message);
    }
}
