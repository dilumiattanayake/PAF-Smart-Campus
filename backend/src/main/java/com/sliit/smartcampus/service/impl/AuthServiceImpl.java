package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.auth.AuthResponse;
import com.sliit.smartcampus.dto.auth.LoginRequest;
import com.sliit.smartcampus.dto.auth.RegisterRequest;
import com.sliit.smartcampus.dto.user.UserResponse;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.UnauthorizedException;
import com.sliit.smartcampus.mapper.UserMapper;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.security.JwtService;
import com.sliit.smartcampus.service.AuthService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .user(UserMapper.toResponse(user))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        if (!user.isActive()) {
            throw new UnauthorizedException("User is inactive");
        }
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .user(UserMapper.toResponse(user))
                .build();
    }

    @Override
    public UserResponse me() {
        String currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("No authenticated user"));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return UserMapper.toResponse(user);
    }
}
