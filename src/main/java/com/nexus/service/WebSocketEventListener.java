package com.nexus.service;

import com.nexus.model.dto.UserPresenceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    // A simple in-memory set to store online users
    public static final Set<String> onlineUsers = new HashSet<>();

    public Set<String> getOnlineUsers() {
        return new HashSet<>(onlineUsers);
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal userPrincipal = headerAccessor.getUser();
        if (userPrincipal != null) {
            String username = userPrincipal.getName();
            onlineUsers.add(username);
            log.info("User connected: {}", username);
            broadcastPresenceUpdate(username, true);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal userPrincipal = headerAccessor.getUser();
        if (userPrincipal != null) {
            String username = userPrincipal.getName();
            onlineUsers.remove(username);
            log.info("User disconnected: {}", username);
            broadcastPresenceUpdate(username, false);
        }
    }

    private void broadcastPresenceUpdate(String username, boolean isOnline) {
        UserPresenceDto presenceUpdate = new UserPresenceDto(username, isOnline);
        messagingTemplate.convertAndSend("/topic/presence", presenceUpdate);
    }
}
