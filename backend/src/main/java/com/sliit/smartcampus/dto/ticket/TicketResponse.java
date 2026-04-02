package com.sliit.smartcampus.dto.ticket;

import com.sliit.smartcampus.dto.comment.CommentResponse;
import com.sliit.smartcampus.model.enums.TicketPriority;
import com.sliit.smartcampus.model.enums.TicketStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
public class TicketResponse {
    private String id;
    private String title;
    private String category;
    private String description;
    private TicketPriority priority;
    private String resourceOrLocation;
    private String preferredContact;
    private List<String> attachmentUrls;
    private String createdByUserId;
    private String createdByUserName;
    private String assignedTechnicianId;
    private TicketStatus status;
    private String resolutionNotes;
    private Instant createdAt;
    private Instant updatedAt;
    private List<CommentResponse> comments;
}
