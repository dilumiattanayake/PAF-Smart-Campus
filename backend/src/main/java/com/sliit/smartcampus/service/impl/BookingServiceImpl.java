package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.booking.BookingCreateRequest;
import com.sliit.smartcampus.dto.booking.BookingDecisionRequest;
import com.sliit.smartcampus.dto.booking.BookingResponse;
import com.sliit.smartcampus.exception.ConflictException;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.BookingMapper;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.enums.BookingStatus;
import com.sliit.smartcampus.model.enums.NotificationType;
import com.sliit.smartcampus.model.enums.Role;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.BookingService;
import com.sliit.smartcampus.service.NotificationService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public BookingResponse create(BookingCreateRequest request) {
        Role role = SecurityUtils.getCurrentUserRole()
                .orElseThrow(() -> new ForbiddenException("Not authenticated"));
        if (role != Role.USER && role != Role.ADMIN) {
            throw new ForbiddenException("Only users or admins can create bookings");
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ConflictException("Start time must be before end time");
        }
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        var resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ForbiddenException("User not found"));

        Booking booking = BookingMapper.toEntity(request, userId);
        // denormalize for faster reads & to avoid missing display data
        booking.setResourceName(resource.getName());
        booking.setRequesterName(user.getFullName());
        booking.setRequesterEmail(user.getEmail());

        ensureNoConflict(booking, null);
        ensureNoUserConflict(booking, null);
        bookingRepository.save(booking);
        return toResponseWithNames(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings() {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        if (role == Role.ADMIN) {
            return bookingRepository.findAll().stream()
                    .map(this::toResponseWithNames)
                    .toList();
        }
        return bookingRepository.findByUserId(userId).stream()
                .map(this::toResponseWithNames)
                .toList();
    }

    @Override
    public List<BookingResponse> getAll(String status, String resourceId, String userId, String dateFrom, String dateTo) {
        ensureAdmin();
        List<Booking> bookings = bookingRepository.findAll();
        BookingStatus filterStatus = parseStatus(status);
        LocalDate from = parseDate(dateFrom);
        LocalDate to = parseDate(dateTo);

        return bookings.stream()
                .filter(b -> filterStatus == null || b.getStatus() == filterStatus)
                .filter(b -> resourceId == null || resourceId.isBlank() || Objects.equals(b.getResourceId(), resourceId))
                .filter(b -> userId == null || userId.isBlank() || Objects.equals(b.getUserId(), userId))
                .filter(b -> from == null || (b.getBookingDate() != null && !b.getBookingDate().isBefore(from)))
                .filter(b -> to == null || (b.getBookingDate() != null && !b.getBookingDate().isAfter(to)))
                .map(this::toResponseWithNames)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        if (!booking.getUserId().equals(userId) && role != Role.ADMIN) {
            throw new ForbiddenException("Not allowed to view this booking");
        }
        return toResponseWithNames(booking);
    }

    @Override
    public BookingResponse approve(String id, BookingDecisionRequest request) {
        ensureAdmin();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(SecurityUtils.getCurrentUserId().orElse(null));
        booking.setRejectionReason(null);
        ensureNoConflict(booking, id);
        ensureNoUserConflict(booking, id);
        bookingRepository.save(booking);
        notificationService.createNotification(booking.getUserId(), "Booking approved",
                "Your booking has been approved.", NotificationType.BOOKING_STATUS, booking.getId());
        return toResponseWithNames(booking);
    }

    @Override
    public BookingResponse reject(String id, BookingDecisionRequest request) {
        ensureAdmin();
        if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
            throw new ConflictException("Rejection reason is required");
        }
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        BookingStatus previousStatus = booking.getStatus();
        if (previousStatus != BookingStatus.PENDING && previousStatus != BookingStatus.APPROVED) {
            throw new ConflictException("Only pending or approved bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(request.getRejectionReason());
        booking.setApprovedBy(SecurityUtils.getCurrentUserId().orElse(null));
        bookingRepository.save(booking);
        String title;
        String message;
        if (previousStatus == BookingStatus.APPROVED) {
            title = "Approved booking rejected";
            message = "Your booking was approved earlier, but an admin has now rejected it. Reason: " + request.getRejectionReason();
        } else {
            title = "Booking rejected";
            message = "Your booking request has been rejected. Reason: " + request.getRejectionReason();
        }
        notificationService.createNotification(booking.getUserId(), title, message, NotificationType.BOOKING_STATUS, booking.getId());
        return toResponseWithNames(booking);
    }

    @Override
    public BookingResponse cancel(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        if (!booking.getUserId().equals(userId) && role != Role.ADMIN) {
            throw new ForbiddenException("Cannot cancel this booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException("Only pending or approved bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        notificationService.createNotification(booking.getUserId(), "Booking cancelled",
                "Booking cancelled successfully", NotificationType.BOOKING_STATUS, booking.getId());
        return toResponseWithNames(booking);
    }

    @Override
    public BookingResponse update(String id, BookingCreateRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        if (!booking.getUserId().equals(userId) && role != Role.ADMIN) {
            throw new ForbiddenException("Not allowed to edit this booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be edited");
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ConflictException("Start time must be before end time");
        }
        var resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        Booking proposed = Booking.builder()
                .id(id)
                .userId(booking.getUserId())
                .resourceId(request.getResourceId())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        ensureNoConflict(proposed, id);
        ensureNoUserConflict(proposed, id);

        booking.setResourceId(request.getResourceId());
        booking.setPurpose(request.getPurpose());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setAttendeeCount(request.getAttendeeCount());
        booking.setNotes(request.getNotes());
        booking.setResourceName(resource.getName());
        bookingRepository.save(booking);
        return toResponseWithNames(booking);
    }

    private void ensureNoConflict(Booking booking, String currentBookingId) {
        List<Booking> conflicts = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                booking.getResourceId(),
                booking.getBookingDate(),
                // Allow multiple pending requests for the same slot; only block once a booking is approved.
                EnumSet.of(BookingStatus.APPROVED)
        );
        LocalTime newStart = booking.getStartTime();
        LocalTime newEnd = booking.getEndTime();
        for (Booking existing : conflicts) {
            if (currentBookingId != null && existing.getId().equals(currentBookingId)) {
                continue;
            }
            if (timesOverlap(newStart, newEnd, existing.getStartTime(), existing.getEndTime())) {
                throw new ConflictException("Time conflict: resource is already booked on " + booking.getBookingDate()
                        + " (" + existing.getStartTime() + "-" + existing.getEndTime() + ").");
            }
        }
    }

    private void ensureNoUserConflict(Booking booking, String currentBookingId) {
        if (booking.getUserId() == null || booking.getUserId().isBlank()) return;
        List<Booking> conflicts = bookingRepository.findByUserIdAndBookingDateAndStatusIn(
                booking.getUserId(),
                booking.getBookingDate(),
                EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED)
        );
        LocalTime newStart = booking.getStartTime();
        LocalTime newEnd = booking.getEndTime();
        for (Booking existing : conflicts) {
            if (currentBookingId != null && existing.getId().equals(currentBookingId)) {
                continue;
            }
            if (timesOverlap(newStart, newEnd, existing.getStartTime(), existing.getEndTime())) {
                String resourceLabel = existing.getResourceName() != null && !existing.getResourceName().isBlank()
                        ? existing.getResourceName()
                        : existing.getResourceId();
                throw new ConflictException("Time conflict: requester already has a booking for " + resourceLabel + " on "
                        + booking.getBookingDate() + " (" + existing.getStartTime() + "-" + existing.getEndTime() + ").");
            }
        }
    }

    private boolean timesOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    private BookingStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return BookingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private BookingResponse toResponseWithNames(Booking booking) {
        var response = BookingMapper.toResponse(booking);
        var resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        var user = userRepository.findById(booking.getUserId()).orElse(null);

        response.setResourceName(resource != null ? resource.getName() : booking.getResourceName());
        response.setRequesterName(user != null ? user.getFullName() : booking.getRequesterName());
        response.setRequesterEmail(user != null ? user.getEmail() : booking.getRequesterEmail());
        return response;
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return null;
        try {
            return LocalDate.parse(date);
        } catch (Exception e) {
            return null;
        }
    }

    private void ensureAdmin() {
        Role role = SecurityUtils.getCurrentUserRole()
                .orElseThrow(() -> new ForbiddenException("Not authenticated"));
        if (role != Role.ADMIN) {
            throw new ForbiddenException("Admin privileges required");
        }
    }

    @Override
    public void delete(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        if (!booking.getUserId().equals(userId) && role != Role.ADMIN) {
            throw new ForbiddenException("Cannot delete this booking");
        }
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.REJECTED) {
            throw new ConflictException("Only approved or rejected bookings can be deleted");
        }
        bookingRepository.deleteById(id);
    }
}
