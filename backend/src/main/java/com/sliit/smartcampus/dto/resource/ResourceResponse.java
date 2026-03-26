package com.sliit.smartcampus.dto.resource;

import com.sliit.smartcampus.model.enums.ResourceStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalTime;

@Getter
@Setter
@Builder
public class ResourceResponse {
    private String id;
    private String name;
    private String type;
    private String description;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
