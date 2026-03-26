package com.sliit.smartcampus.dto.user;

import com.sliit.smartcampus.model.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class UserResponse {
    private String id;
    private String fullName;
    private String email;
    private Role role;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
