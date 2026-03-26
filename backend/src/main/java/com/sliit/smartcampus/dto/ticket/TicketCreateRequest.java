package com.sliit.smartcampus.dto.ticket;

import com.sliit.smartcampus.model.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TicketCreateRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String category;
    @NotBlank
    private String description;
    @NotNull
    private TicketPriority priority;
    @NotBlank
    private String resourceOrLocation;
    private String preferredContact;

    @Size(max = 3, message = "Up to 3 attachment URLs allowed")
    private List<String> attachmentUrls;
}
