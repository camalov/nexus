package com.nexus.service;

import com.nexus.model.dto.UserDetailsDto;
import com.nexus.model.dto.UserSearchDto;
import com.nexus.model.entity.Role;
import com.nexus.model.entity.User;
import com.nexus.repository.MessageRepository;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public List<UserSearchDto> searchUsers(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username)
                .stream()
                .map(user -> new UserSearchDto(user.getId(), user.getUsername()))
                .collect(Collectors.toList());
    }

    public List<UserDetailsDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDetailsDto)
                .collect(Collectors.toList());
    }

    public UserDetailsDto getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(this::mapToUserDetailsDto)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<UserSearchDto> getContacts(Long userId) {
        // Təkrarlanmanın qarşısını almaq üçün Set istifadə edirik
        Set<User> contacts = new HashSet<>();

        // İstifadəçinin mesaj göndərdiyi şəxsləri əlavə edirik
        contacts.addAll(messageRepository.findRecipientsForSender(userId));

        // İstifadəçiyə mesaj göndərən şəxsləri əlavə edirik
        contacts.addAll(messageRepository.findSendersForRecipient(userId));

        // Yekun siyahını DTO-ya çevirib qaytarırıq
        return contacts.stream()
                .map(user -> new UserSearchDto(user.getId(), user.getUsername()))
                .collect(Collectors.toList());
    }

    private UserDetailsDto mapToUserDetailsDto(User user) {
        return new UserDetailsDto(
                user.getId(),
                user.getUsername(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()),
                user.getLastLoginIp(),
                user.getDeviceDetails(),
                user.getLastLoginTimestamp()
        );
    }
}
