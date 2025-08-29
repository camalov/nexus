package com.nexus.service;

import com.nexus.model.dto.AuthResponse;
import com.nexus.model.dto.LoginRequest;
import com.nexus.model.dto.RegisterRequest;
import com.nexus.model.entity.Role;
import com.nexus.model.entity.User;
import com.nexus.repository.RoleRepository;
import com.nexus.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("Default role not found"));
        user.setRoles(Set.of(userRole));

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(user.getId(), user.getUsername(), jwtToken);
    }

    public AuthResponse login(LoginRequest request, HttpServletRequest httpServletRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        user.setLastLoginIp(httpServletRequest.getRemoteAddr());
        user.setDeviceDetails(httpServletRequest.getHeader("User-Agent"));
        user.setLastLoginTimestamp(LocalDateTime.now());
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(user.getId(), user.getUsername(), jwtToken);
    }
}
