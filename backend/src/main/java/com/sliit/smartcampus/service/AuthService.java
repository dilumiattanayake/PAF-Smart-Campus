package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.auth.AuthResponse;
import com.sliit.smartcampus.dto.auth.LoginRequest;
import com.sliit.smartcampus.dto.auth.RegisterRequest;
import com.sliit.smartcampus.dto.user.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse me();
}
