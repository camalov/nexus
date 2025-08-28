package com.nexus.repository;

import com.nexus.model.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface MessageRepository extends JpaRepository<Message, Long> {
    void deleteByExpiresAtBefore(LocalDateTime timestamp);
}
