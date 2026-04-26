package com.sliit.smartcampus.dto.booking;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@Builder
public class BookingRecommendation {
    private String resourceId;
    private String resourceName;
    private String resourceType;
    private String location;
    private Integer capacity;
    private LocalTime availableFrom;
    private LocalTime availableTo;
}
