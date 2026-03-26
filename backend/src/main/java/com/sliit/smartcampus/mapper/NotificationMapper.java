package com.sliit.smartcampus.mapper;

import com.sliit.smartcampus.dto.notification.NotificationResponse;
import com.sliit.smartcampus.model.Notification;

public final class NotificationMapper {
    private NotificationMapper() {}

    public static NotificationResponse toResponse(Notification notification) {
        if (notification == null) return null;
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
