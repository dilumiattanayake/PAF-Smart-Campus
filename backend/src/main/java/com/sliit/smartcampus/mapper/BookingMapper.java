package com.sliit.smartcampus.mapper;

import com.sliit.smartcampus.dto.booking.BookingCreateRequest;
import com.sliit.smartcampus.dto.booking.BookingResponse;
import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.enums.BookingStatus;

public final class BookingMapper {
    private BookingMapper() {}

    public static Booking toEntity(BookingCreateRequest request, String userId) {
        return Booking.builder()
                .resourceId(request.getResourceId())
                .userId(userId)
                .purpose(request.getPurpose())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .attendeeCount(request.getAttendeeCount())
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .build();
    }

    // Note: enrich with names/emails in service layer; this mapper only handles core fields.
    public static BookingResponse toResponse(Booking booking) {
        if (booking == null) return null;
        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .userId(booking.getUserId())
                .purpose(booking.getPurpose())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .attendeeCount(booking.getAttendeeCount())
                .notes(booking.getNotes())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .approvedBy(booking.getApprovedBy())
                .resourceName(booking.getResourceName())
                .requesterName(booking.getRequesterName())
                .requesterEmail(booking.getRequesterEmail())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
