package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.user.UserResponse;
import com.sliit.smartcampus.model.User;

public interface UserService {
    UserResponse getCurrentUser();
    User getById(String id);
}
