package com.sliit.smartcampus.model;

import com.sliit.smartcampus.model.enums.TicketPriority;
import com.sliit.smartcampus.model.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;
    private String title;
    private String category;
    private String description;
    private TicketPriority priority;
    private String resourceOrLocation;
    private String preferredContact;
    private List<String> attachmentUrls;
    private String createdByUserId;
    private String assignedTechnicianId;
    private TicketStatus status;
    private String resolutionNotes;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
