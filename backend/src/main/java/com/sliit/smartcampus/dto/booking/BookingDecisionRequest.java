package com.sliit.smartcampus.dto.booking;

import com.sliit.smartcampus.model.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingDecisionRequest {
    @NotNull
    private BookingStatus status;
    private String rejectionReason;
}
