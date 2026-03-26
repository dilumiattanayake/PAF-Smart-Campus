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
import com.sliit.smartcampus.service.BookingService;
import com.sliit.smartcampus.service.NotificationService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    @Override
    public BookingResponse create(BookingCreateRequest request) {
        Role role = SecurityUtils.getCurrentUserRole()
                .orElseThrow(() -> new ForbiddenException("Not authenticated"));
        if (role != Role.USER && role != Role.ADMIN) {
            throw new ForbiddenException("Only users or admins can create bookings");
        }
        // validate resource exists
        resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ConflictException("Start time must be before end time");
        }
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Booking booking = BookingMapper.toEntity(request, userId);

        ensureNoConflict(booking, null);
        bookingRepository.save(booking);
        return BookingMapper.toResponse(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings() {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        if (role == Role.ADMIN) {
            return bookingRepository.findAll().stream()
                    .map(BookingMapper::toResponse)
                    .toList();
        }
        return bookingRepository.findByUserId(userId).stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getAll() {
        ensureAdmin();
        return bookingRepository.findAll().stream()
                .map(BookingMapper::toResponse)
                .toList();
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
        return BookingMapper.toResponse(booking);
    }

    @Override
    public BookingResponse approve(String id, BookingDecisionRequest request) {
        ensureAdmin();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(SecurityUtils.getCurrentUserId().orElse(null));
        booking.setRejectionReason(null);
        ensureNoConflict(booking, id);
        bookingRepository.save(booking);
        notificationService.createNotification(booking.getUserId(), "Booking approved",
                "Your booking has been approved.", NotificationType.BOOKING_STATUS, booking.getId());
        return BookingMapper.toResponse(booking);
    }

    @Override
    public BookingResponse reject(String id, BookingDecisionRequest request) {
        ensureAdmin();
        if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
            throw new ConflictException("Rejection reason is required");
        }
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(request.getRejectionReason());
        booking.setApprovedBy(SecurityUtils.getCurrentUserId().orElse(null));
        bookingRepository.save(booking);
        notificationService.createNotification(booking.getUserId(), "Booking rejected",
                "Booking rejected: " + request.getRejectionReason(), NotificationType.BOOKING_STATUS, booking.getId());
        return BookingMapper.toResponse(booking);
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
        return BookingMapper.toResponse(booking);
    }

    private void ensureNoConflict(Booking booking, String currentBookingId) {
        List<Booking> conflicts = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                booking.getResourceId(),
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
                throw new ConflictException("Booking time conflicts with existing booking");
            }
        }
    }

    private boolean timesOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    private void ensureAdmin() {
        Role role = SecurityUtils.getCurrentUserRole()
                .orElseThrow(() -> new ForbiddenException("Not authenticated"));
        if (role != Role.ADMIN) {
            throw new ForbiddenException("Admin privileges required");
        }
    }
}
