package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.ticket.TicketCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketResponse;
import com.sliit.smartcampus.dto.ticket.TicketUpdateRequest;
import com.sliit.smartcampus.model.enums.TicketStatus;

import java.util.List;

public interface TicketService {
    TicketResponse create(TicketCreateRequest request);
    List<TicketResponse> getMyTickets();
    List<TicketResponse> getAssignedTickets();
    List<TicketResponse> getAll();
    TicketResponse getById(String id);
    TicketResponse assign(String id, String technicianId);
    TicketResponse updateStatus(String id, TicketStatus status, String resolutionNotes);
    TicketResponse updateResolution(String id, String notes);
}
