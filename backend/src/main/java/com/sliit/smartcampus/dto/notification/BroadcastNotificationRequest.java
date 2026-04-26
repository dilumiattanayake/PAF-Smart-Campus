package com.sliit.smartcampus.dto.notification;

import com.sliit.smartcampus.model.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BroadcastNotificationRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Target roles are required")
    private List<Role> targetRoles;

    public BroadcastNotificationRequest() {
    }

    public BroadcastNotificationRequest(String title, String message, List<Role> targetRoles) {
        this.title = title;
        this.message = message;
        this.targetRoles = targetRoles;
    }
}
