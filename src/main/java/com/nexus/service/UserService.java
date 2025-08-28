package com.nexus.service;

import com.nexus.model.dto.UserDetailsDto;
import com.nexus.model.dto.UserSearchDto;
import com.nexus.model.entity.Role;
import com.nexus.model.entity.User;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private UserDetailsDto mapToUserDetailsDto(User user) {
        return new UserDetailsDto(
                user.getId(),
                user.getUsername(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
        );
    }
}
