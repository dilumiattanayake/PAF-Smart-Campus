package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.notification.BroadcastNotificationRequest;
import com.sliit.smartcampus.dto.notification.NotificationCreateRequest;
import com.sliit.smartcampus.dto.notification.NotificationResponse;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.NotificationMapper;
import com.sliit.smartcampus.model.Notification;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.model.enums.NotificationType;
import com.sliit.smartcampus.repository.NotificationRepository;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.NotificationService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

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

    @Override
    @Transactional
    public NotificationResponse createNotificationByAdmin(NotificationCreateRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .referenceId(request.getReferenceId())
                .read(false)
                .build();
        notificationRepository.save(notification);
        return NotificationMapper.toResponse(notification);
    }

    @Override
    @Transactional
    public Map<String, Object> broadcastNotification(BroadcastNotificationRequest request) {
        List<Notification> notifications = new java.util.ArrayList<>();

        for (var role : request.getTargetRoles()) {
            List<User> users = userRepository.findByRole(role);
            for (User user : users) {
                Notification notification = Notification.builder()
                        .userId(user.getId())
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type(NotificationType.BROADCAST)
                        .read(false)
                        .build();
                notifications.add(notification);
            }
        }

        notificationRepository.saveAll(notifications);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Broadcast notification sent successfully");
        response.put("notificationsSent", notifications.size());
        return response;
    }

    @Override
    @Transactional
    public void deleteNotification(String id) {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot delete another user's notification");
        }
        notificationRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteAllNotifications() {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
    }

    @Override
    public long getUnreadCount() {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
}
