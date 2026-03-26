package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.notification.NotificationResponse;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.NotificationMapper;
import com.sliit.smartcampus.model.Notification;
import com.sliit.smartcampus.model.enums.NotificationType;
import com.sliit.smartcampus.repository.NotificationRepository;
import com.sliit.smartcampus.service.NotificationService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<NotificationResponse> getForCurrentUser() {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationMapper::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(String id) {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return NotificationMapper.toResponse(notification);
    }

    @Override
    public void markAllAsRead() {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void createNotification(String userId, String title, String message, NotificationType type, String referenceId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }
}
