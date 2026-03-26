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
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
    public List<ResourceResponse> getAll(String query, String status) {
        List<Resource> resources = new ArrayList<>();
        if (query != null && !query.isBlank()) {
            resources.addAll(resourceRepository.findByNameContainingIgnoreCaseOrTypeContainingIgnoreCaseOrLocationContainingIgnoreCase(query, query, query));
        } else if (status != null && !status.isBlank()) {
            ResourceStatus resStatus = ResourceStatus.valueOf(status.toUpperCase());
            resources.addAll(resourceRepository.findByStatus(resStatus));
        } else {
            resources.addAll(resourceRepository.findAll());
        }
        return resources.stream().map(ResourceMapper::toResponse).toList();
    }

    private void ensureAdmin() {
        Optional<Role> role = SecurityUtils.getCurrentUserRole();
        if (role.isEmpty() || role.get() != Role.ADMIN) {
            throw new ForbiddenException("Admin privileges required");
        }
    }
}
