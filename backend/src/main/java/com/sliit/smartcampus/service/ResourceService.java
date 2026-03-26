package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.resource.ResourceCreateRequest;
import com.sliit.smartcampus.dto.resource.ResourceResponse;
import com.sliit.smartcampus.dto.resource.ResourceUpdateRequest;

import java.util.List;

public interface ResourceService {
    ResourceResponse create(ResourceCreateRequest request);
    ResourceResponse update(String id, ResourceUpdateRequest request);
    void delete(String id);
    ResourceResponse getById(String id);
    List<ResourceResponse> getAll(String query, String status, String type, String location, Integer minCapacity);
}
