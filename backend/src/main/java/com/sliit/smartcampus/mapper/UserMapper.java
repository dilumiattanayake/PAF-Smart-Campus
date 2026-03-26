package com.sliit.smartcampus.mapper;

import com.sliit.smartcampus.dto.user.UserResponse;
import com.sliit.smartcampus.model.User;

public final class UserMapper {
    private UserMapper() {}

    public static UserResponse toResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
