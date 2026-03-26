package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.resource.ResourceCreateRequest;
import com.sliit.smartcampus.dto.resource.ResourceResponse;
import com.sliit.smartcampus.dto.resource.ResourceUpdateRequest;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.ResourceMapper;
import com.sliit.smartcampus.model.Resource;
import com.sliit.smartcampus.model.enums.ResourceStatus;
import com.sliit.smartcampus.model.enums.Role;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.service.ResourceService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public ResourceResponse create(ResourceCreateRequest request) {
        ensureAdmin();
        Resource resource = ResourceMapper.toEntity(request);
        resourceRepository.save(resource);
        return ResourceMapper.toResponse(resource);
    }

    @Override
    public ResourceResponse update(String id, ResourceUpdateRequest request) {
        ensureAdmin();
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        ResourceMapper.update(resource, request);
        resourceRepository.save(resource);
        return ResourceMapper.toResponse(resource);
    }

    @Override
    public void delete(String id) {
        ensureAdmin();
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public ResourceResponse getById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        return ResourceMapper.toResponse(resource);
    }

    @Override
    public List<ResourceResponse> getAll(String query, String status, String type, String location, Integer minCapacity) {
        List<Resource> resources = new ArrayList<>(resourceRepository.findAll());

        ResourceStatus parsedStatus = resolveStatus(status);

        return resources.stream()
                .filter(r -> {
                    if (StringUtils.hasText(query)) {
                        String q = query.toLowerCase();
                        return (r.getName() != null && r.getName().toLowerCase().contains(q))
                                || (r.getType() != null && r.getType().toLowerCase().contains(q))
                                || (r.getLocation() != null && r.getLocation().toLowerCase().contains(q));
                    }
                    return true;
                })
                .filter(r -> {
                    if (parsedStatus == null) return true;
                    ResourceStatus actual = resolveStatus(r.getStatus() != null ? r.getStatus().name() : null);
                    return actual == parsedStatus;
                })
                .filter(r -> !StringUtils.hasText(type) || (r.getType() != null && r.getType().equalsIgnoreCase(type)))
                .filter(r -> !StringUtils.hasText(location) || (r.getLocation() != null && r.getLocation().toLowerCase().contains(location.toLowerCase())))
                .filter(r -> minCapacity == null || (r.getCapacity() != null && r.getCapacity() >= minCapacity))
                .map(ResourceMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void ensureAdmin() {
        Optional<Role> role = SecurityUtils.getCurrentUserRole();
        if (role.isEmpty() || role.get() != Role.ADMIN) {
            throw new ForbiddenException("Admin privileges required");
        }
    }

    private ResourceStatus resolveStatus(String status) {
        if (!StringUtils.hasText(status)) return null;
        return switch (status.trim().toUpperCase()) {
            case "AVAILABLE", "ACTIVE" -> ResourceStatus.ACTIVE;
            case "UNAVAILABLE", "OUT_OF_SERVICE" -> ResourceStatus.OUT_OF_SERVICE;
            case "MAINTENANCE" -> ResourceStatus.MAINTENANCE;
            default -> null;
        };
    }
}
