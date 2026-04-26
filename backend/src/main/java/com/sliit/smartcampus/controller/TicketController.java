package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.ticket.TicketCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketResponse;
import com.sliit.smartcampus.dto.ticket.TicketUpdateRequest;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.model.enums.TicketStatus;
import com.sliit.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8"})
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.create(request));
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE + ";charset=UTF-8"})
    public ResponseEntity<TicketResponse> createWithAttachments(
            @Valid @RequestPart("ticket") TicketCreateRequest request,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createWithAttachments(request, attachments));
    }

    @GetMapping("/attachments/{filename:.+}")
    public ResponseEntity<Resource> getAttachment(@PathVariable String filename) throws IOException {
        Resource attachment = ticketService.loadAttachment(filename);
        String detectedType = Files.probeContentType(attachment.getFile().toPath());
        String contentType = detectedType != null ? detectedType : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(attachment);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> myTickets() {
        return ResponseEntity.ok(ticketService.getMyTickets());
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> assignedTickets() {
        return ResponseEntity.ok(ticketService.getAssignedTickets());
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> all() {
        return ResponseEntity.ok(ticketService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PatchMapping("/{id}/assign/{technicianId}")
    public ResponseEntity<TicketResponse> assign(@PathVariable String id, @PathVariable String technicianId) {
        return ResponseEntity.ok(ticketService.assign(id, technicianId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable String id, @RequestBody TicketUpdateRequest request) {
        if (request.getStatus() == null) {
            throw new BadRequestException("Status is required");
        }
        return ResponseEntity.ok(ticketService.updateStatus(id, request.getStatus(), request.getResolutionNotes()));
    }

    @PatchMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> updateResolution(@PathVariable String id, @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateResolution(id, request.getResolutionNotes()));
    }
}
