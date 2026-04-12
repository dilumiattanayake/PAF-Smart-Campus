package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.notification.NotificationCreateRequest;
import com.sliit.smartcampus.dto.notification.NotificationResponse;
import com.sliit.smartcampus.model.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getForCurrentUser();
    NotificationResponse markAsRead(String id);
    void markAllAsRead();
    void createNotification(String userId, String title, String message, NotificationType type, String referenceId);
    NotificationResponse createNotificationByAdmin(NotificationCreateRequest request);
    void deleteNotification(String id);
    void deleteAllNotifications();
    long getUnreadCount();
}
