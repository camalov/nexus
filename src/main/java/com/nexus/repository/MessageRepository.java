package com.nexus.repository;

import com.nexus.model.entity.Message;
import com.nexus.model.entity.MessageType;
import com.nexus.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

import java.time.LocalDateTime;

public interface MessageRepository extends JpaRepository<Message, Long> {
    void deleteByExpiresAtBefore(LocalDateTime timestamp);

    @Query("SELECT m FROM Message m WHERE ((m.sender.id = :senderId AND m.recipient.id = :recipientId) OR (m.sender.id = :recipientId AND m.recipient.id = :senderId)) AND m.deleted = false")
    Page<Message> findConversation(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId, Pageable pageable);

    @Query("SELECT DISTINCT m.recipient FROM Message m WHERE m.sender.id = :userId")
    List<User> findRecipientsForSender(@Param("userId") Long userId);

    @Query("SELECT DISTINCT m.sender FROM Message m WHERE m.recipient.id = :userId")
    List<User> findSendersForRecipient(@Param("userId") Long userId);

    List<Message> findAllByTypeIn(List<MessageType> types);
}
