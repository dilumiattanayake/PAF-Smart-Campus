package com.sliit.smartcampus.mapper;

import com.sliit.smartcampus.dto.resource.ResourceCreateRequest;
import com.sliit.smartcampus.dto.resource.ResourceResponse;
import com.sliit.smartcampus.dto.resource.ResourceUpdateRequest;
import com.sliit.smartcampus.model.Resource;
import com.sliit.smartcampus.model.enums.ResourceStatus;

public final class ResourceMapper {
    private ResourceMapper() {}

    public static Resource toEntity(ResourceCreateRequest request) {
        return Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(request.getStatus())
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .imageUrl(request.getImageUrl())
                .build();
    }

    public static void update(Resource resource, ResourceUpdateRequest request) {
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setDescription(request.getDescription());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setStatus(request.getStatus());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setImageUrl(request.getImageUrl());
    }

    public static ResourceResponse toResponse(Resource resource) {
        if (resource == null) return null;
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .description(resource.getDescription())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .status(normalize(resource.getStatus()))
                .availableFrom(resource.getAvailableFrom())
                .availableTo(resource.getAvailableTo())
                .imageUrl(resource.getImageUrl())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }

    private static ResourceStatus normalize(ResourceStatus status) {
        if (status == null) return null;
        return switch (status) {
            case AVAILABLE -> ResourceStatus.ACTIVE;
            case UNAVAILABLE -> ResourceStatus.OUT_OF_SERVICE;
            default -> status;
        };
    }
}
