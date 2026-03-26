package com.sliit.smartcampus.dto.booking;

import com.sliit.smartcampus.model.enums.BookingStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
public class BookingResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String requesterName;
    private String requesterEmail;
    private String purpose;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer attendeeCount;
    private String notes;
    private BookingStatus status;
    private String rejectionReason;
    private String approvedBy;
    private Instant createdAt;
    private Instant updatedAt;
}
