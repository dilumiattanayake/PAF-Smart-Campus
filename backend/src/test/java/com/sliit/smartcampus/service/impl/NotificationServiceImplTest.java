package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.notification.NotificationResponse;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.Notification;
import com.sliit.smartcampus.model.enums.NotificationType;
import com.sliit.smartcampus.repository.NotificationRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @BeforeEach
    void setUpAuth() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user-1", "N/A", List.of())
        );
    }

    @AfterEach
    void clearAuth() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getForCurrentUser_returnsMappedNotificationsForCurrentUser() {
        Notification n = Notification.builder()
                .id("n1")
                .userId("user-1")
                .title("Booking approved")
                .message("Your booking has been approved")
                .type(NotificationType.BOOKING_STATUS)
                .referenceId("b1")
                .createdAt(Instant.now())
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("user-1")).thenReturn(List.of(n));

        List<NotificationResponse> result = notificationService.getForCurrentUser();

        assertEquals(1, result.size());
        assertEquals("n1", result.get(0).getId());
        assertEquals("user-1", result.get(0).getUserId());
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc("user-1");
    }

    @Test
    void markAsRead_setsReadTrue_whenOwnedByCurrentUser() {
        Notification n = Notification.builder()
                .id("n1")
                .userId("user-1")
                .read(false)
                .type(NotificationType.TICKET_STATUS)
                .build();

        when(notificationRepository.findById("n1")).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationResponse response = notificationService.markAsRead("n1");

        assertTrue(response.isRead());
        verify(notificationRepository).save(n);
    }

    @Test
    void markAsRead_throwsNotFound_whenNotificationBelongsToAnotherUser() {
        Notification n = Notification.builder()
                .id("n1")
                .userId("user-2")
                .read(false)
                .build();

        when(notificationRepository.findById("n1")).thenReturn(Optional.of(n));

        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAsRead("n1"));
    }

    @Test
    void createNotification_savesUnreadNotification() {
        notificationService.createNotification(
                "user-1",
                "New ticket comment",
                "A new comment was added",
                NotificationType.COMMENT,
                "t123"
        );

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();

        assertEquals("user-1", saved.getUserId());
        assertEquals(NotificationType.COMMENT, saved.getType());
        assertEquals("t123", saved.getReferenceId());
        assertFalse(saved.isRead());
    }

    @Test
    void deleteNotification_throwsForbidden_whenDeletingAnotherUsersNotification() {
        Notification n = Notification.builder()
                .id("n1")
                .userId("user-2")
                .build();

        when(notificationRepository.findById("n1")).thenReturn(Optional.of(n));

        assertThrows(ForbiddenException.class, () -> notificationService.deleteNotification("n1"));
    }

    @Test
    void getUnreadCount_returnsCurrentUsersUnreadCount() {
        when(notificationRepository.countByUserIdAndReadFalse("user-1")).thenReturn(4L);

        long count = notificationService.getUnreadCount();

        assertEquals(4L, count);
        verify(notificationRepository).countByUserIdAndReadFalse("user-1");
    }
}
