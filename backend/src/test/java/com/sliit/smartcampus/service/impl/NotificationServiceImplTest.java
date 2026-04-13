package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.notification.BroadcastNotificationRequest;
import com.sliit.smartcampus.dto.notification.NotificationCreateRequest;
import com.sliit.smartcampus.dto.notification.NotificationResponse;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.Notification;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.model.enums.NotificationType;
import com.sliit.smartcampus.model.enums.Role;
import com.sliit.smartcampus.repository.NotificationRepository;
import com.sliit.smartcampus.repository.UserRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

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
    void deleteNotification_deletesNotification_whenOwnedByCurrentUser() {
        Notification n = Notification.builder()
                .id("n1")
                .userId("user-1")
                .build();

        when(notificationRepository.findById("n1")).thenReturn(Optional.of(n));

        notificationService.deleteNotification("n1");

        verify(notificationRepository).deleteById("n1");
    }

    @Test
    void markAllAsRead_marksAllCurrentUsersNotificationsAsRead() {
        Notification n1 = Notification.builder()
                .id("n1")
                .userId("user-1")
                .read(false)
                .type(NotificationType.BOOKING_STATUS)
                .build();
        Notification n2 = Notification.builder()
                .id("n2")
                .userId("user-1")
                .read(false)
                .type(NotificationType.TICKET)
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("user-1")).thenReturn(List.of(n1, n2));

        List<Notification> saved = new ArrayList<>();
        when(notificationRepository.saveAll(anyList())).thenAnswer(inv -> {
            List<Notification> list = inv.getArgument(0);
            saved.clear();
            saved.addAll(list);
            return list;
        });

        notificationService.markAllAsRead();

        assertEquals(2, saved.size());
        assertTrue(saved.get(0).isRead());
        assertTrue(saved.get(1).isRead());
    }

    @Test
    void deleteAllNotifications_deletesAllCurrentUsersNotifications() {
        Notification n1 = Notification.builder()
                .id("n1")
                .userId("user-1")
                .build();
        Notification n2 = Notification.builder()
                .id("n2")
                .userId("user-1")
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("user-1")).thenReturn(List.of(n1, n2));

        notificationService.deleteAllNotifications();

        verify(notificationRepository).deleteAll(List.of(n1, n2));
    }

    @Test
    void createNotificationByAdmin_savesNotificationWithProvidedDetails() {
        NotificationCreateRequest request = new NotificationCreateRequest();
        request.setUserId("user-2");
        request.setTitle("Manual notification");
        request.setMessage("This is manually created");
        request.setType(NotificationType.BROADCAST);
        request.setReferenceId("ref-1");

        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            n.setId("n-auto");
            return n;
        });

        NotificationResponse response = notificationService.createNotificationByAdmin(request);

        assertEquals("n-auto", response.getId());
        assertEquals("user-2", response.getUserId());
        assertEquals("Manual notification", response.getTitle());
        assertEquals("This is manually created", response.getMessage());
        assertEquals(NotificationType.BROADCAST, response.getType());

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();
        assertFalse(saved.isRead());
    }

    @Test
    void broadcastNotification_createsNotificationsForAllUsersInTargetRoles() {
        User user1 = User.builder().id("u1").role(Role.USER).build();
        User user2 = User.builder().id("u2").role(Role.USER).build();
        User tech1 = User.builder().id("t1").role(Role.TECHNICIAN).build();
        List<Notification> notifications = new ArrayList<>();

        when(userRepository.findByRole(Role.USER)).thenReturn(List.of(user1, user2));
        when(userRepository.findByRole(Role.TECHNICIAN)).thenReturn(List.of(tech1));
        when(notificationRepository.saveAll(anyList())).thenAnswer(inv -> {
            List<Notification> list = inv.getArgument(0);
            notifications.clear();
            notifications.addAll(list);
            return list;
        });

        BroadcastNotificationRequest request = new BroadcastNotificationRequest(
                "System Maintenance",
                "Scheduled maintenance at 2 AM",
                List.of(Role.USER, Role.TECHNICIAN)
        );

        Map<String, Object> response = notificationService.broadcastNotification(request);

        assertTrue((Boolean) response.get("success"));
        assertEquals("Broadcast notification sent successfully", response.get("message"));
        assertEquals(3, response.get("notificationsSent"));

        assertEquals(3, notifications.size());
        assertEquals(NotificationType.BROADCAST, notifications.get(0).getType());
        assertTrue(notifications.stream().anyMatch(n -> n.getUserId().equals("u1")));
        assertTrue(notifications.stream().anyMatch(n -> n.getUserId().equals("u2")));
        assertTrue(notifications.stream().anyMatch(n -> n.getUserId().equals("t1")));
    }

    @Test
    void broadcastNotification_createsNotificationsOnlyForAdmins_whenOnlyAdminRoleSelected() {
        User admin1 = User.builder().id("a1").role(Role.ADMIN).build();
        User admin2 = User.builder().id("a2").role(Role.ADMIN).build();
        List<Notification> notifications = new ArrayList<>();

        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(admin1, admin2));
        when(notificationRepository.saveAll(anyList())).thenAnswer(inv -> {
            List<Notification> list = inv.getArgument(0);
            notifications.clear();
            notifications.addAll(list);
            return list;
        });

        BroadcastNotificationRequest request = new BroadcastNotificationRequest(
                "Admin Alert",
                "Important admin notification",
                List.of(Role.ADMIN)
        );

        Map<String, Object> response = notificationService.broadcastNotification(request);

        assertEquals(2, response.get("notificationsSent"));

        assertEquals(2, notifications.size());
        assertTrue(notifications.stream().allMatch(n -> n.getUserId().equals("a1") || n.getUserId().equals("a2")));
    }

    @Test
    void getUnreadCount_returnsCurrentUsersUnreadCount() {
        when(notificationRepository.countByUserIdAndReadFalse("user-1")).thenReturn(4L);

        long count = notificationService.getUnreadCount();

        assertEquals(4L, count);
        verify(notificationRepository).countByUserIdAndReadFalse("user-1");
    }
}
