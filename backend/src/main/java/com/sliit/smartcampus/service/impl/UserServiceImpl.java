package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.user.UserResponse;
import com.sliit.smartcampus.exception.UnauthorizedException;
import com.sliit.smartcampus.mapper.UserMapper;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.UserService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getCurrentUser() {
        String id = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("No authenticated user"));
        return UserMapper.toResponse(getById(id));
    }

    @Override
    public User getById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
