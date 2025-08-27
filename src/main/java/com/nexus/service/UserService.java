package com.nexus.service;

import com.nexus.model.dto.UserSearchDto;
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
}
