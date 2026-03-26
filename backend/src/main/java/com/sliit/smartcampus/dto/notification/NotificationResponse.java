package com.sliit.smartcampus.dto.notification;

import com.sliit.smartcampus.model.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class NotificationResponse {
    private String id;
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private String referenceId;
    private Instant createdAt;
}
