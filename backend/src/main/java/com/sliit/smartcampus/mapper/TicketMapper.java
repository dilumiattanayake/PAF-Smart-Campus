package com.sliit.smartcampus.mapper;

import com.sliit.smartcampus.dto.comment.CommentResponse;
import com.sliit.smartcampus.dto.ticket.TicketCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketResponse;
import com.sliit.smartcampus.model.Ticket;
import com.sliit.smartcampus.model.enums.TicketStatus;

import java.util.List;

public final class TicketMapper {
    private TicketMapper() {}

    public static Ticket toEntity(TicketCreateRequest request, String userId) {
        return Ticket.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .resourceOrLocation(request.getResourceOrLocation())
                .preferredContact(request.getPreferredContact())
                .attachmentUrls(request.getAttachmentUrls())
                .createdByUserId(userId)
                .status(TicketStatus.OPEN)
                .build();
    }

    public static TicketResponse toResponse(Ticket ticket, List<CommentResponse> comments) {
        if (ticket == null) return null;
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .resourceOrLocation(ticket.getResourceOrLocation())
                .preferredContact(ticket.getPreferredContact())
                .attachmentUrls(ticket.getAttachmentUrls())
                .createdByUserId(ticket.getCreatedByUserId())
                .assignedTechnicianId(ticket.getAssignedTechnicianId())
                .status(ticket.getStatus())
                .resolutionNotes(ticket.getResolutionNotes())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .comments(comments)
                .build();
    }
}
