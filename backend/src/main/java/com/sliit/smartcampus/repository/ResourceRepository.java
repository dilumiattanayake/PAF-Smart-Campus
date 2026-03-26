package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Resource;
import com.sliit.smartcampus.model.enums.ResourceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByNameContainingIgnoreCaseOrTypeContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String type, String location);
    List<Resource> findByStatus(ResourceStatus status);
}
