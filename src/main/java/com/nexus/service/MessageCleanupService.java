package com.nexus.service;

import com.nexus.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MessageCleanupService {

    private final MessageRepository messageRepository;

    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void deleteExpiredMessages() {
        messageRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
