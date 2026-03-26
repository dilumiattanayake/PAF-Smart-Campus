package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.resource.ResourceCreateRequest;
import com.sliit.smartcampus.dto.resource.ResourceResponse;
import com.sliit.smartcampus.dto.resource.ResourceUpdateRequest;
import com.sliit.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAll(@RequestParam(required = false) String q,
                                                         @RequestParam(required = false) String status,
                                                         @RequestParam(required = false) String type,
                                                         @RequestParam(required = false) String location,
                                                         @RequestParam(required = false) Integer minCapacity) {
        return ResponseEntity.ok(resourceService.getAll(q, status, type, location, minCapacity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getOne(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> create(@Valid @RequestBody ResourceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> update(@PathVariable String id, @Valid @RequestBody ResourceUpdateRequest request) {
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
