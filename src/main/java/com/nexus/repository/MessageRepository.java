package com.nexus.repository;

import com.nexus.model.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

import java.time.LocalDateTime;

public interface MessageRepository extends JpaRepository<Message, Long> {
    void deleteByExpiresAtBefore(LocalDateTime timestamp);

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :senderId AND m.recipient.id = :recipientId) OR (m.sender.id = :recipientId AND m.recipient.id = :senderId) ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId);

    @Query("SELECT DISTINCT u.id FROM Message m JOIN m.sender s JOIN m.recipient r, User u WHERE (s.id = :userId OR r.id = :userId) AND u.id IN (s.id, r.id) AND u.id != :userId")
    List<Long> findDistinctConversationPartnerIds(@Param("userId") Long userId);
}
