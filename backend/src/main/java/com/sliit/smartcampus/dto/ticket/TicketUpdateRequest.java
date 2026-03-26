package com.sliit.smartcampus.dto.ticket;

import com.sliit.smartcampus.model.enums.TicketPriority;
import com.sliit.smartcampus.model.enums.TicketStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TicketUpdateRequest {
    private String title;
    private String category;
    private String description;
    private TicketPriority priority;
    private String resourceOrLocation;
    private String preferredContact;

    @Size(max = 3, message = "Up to 3 attachment URLs allowed")
    private List<String> attachmentUrls;

    private TicketStatus status;
    private String resolutionNotes;
}
