package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.comment.CommentResponse;
import com.sliit.smartcampus.dto.ticket.TicketCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketResponse;
import com.sliit.smartcampus.dto.ticket.TicketUpdateRequest;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.CommentMapper;
import com.sliit.smartcampus.mapper.TicketMapper;
import com.sliit.smartcampus.model.Comment;
import com.sliit.smartcampus.model.Ticket;
import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.model.enums.NotificationType;
import com.sliit.smartcampus.model.enums.Role;
import com.sliit.smartcampus.model.enums.TicketStatus;
import com.sliit.smartcampus.repository.CommentRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.NotificationService;
import com.sliit.smartcampus.service.TicketService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public TicketResponse create(TicketCreateRequest request) {
        Role role = SecurityUtils.getCurrentUserRole()
                .orElseThrow(() -> new ForbiddenException("Not authenticated"));
        if (role != Role.USER && role != Role.ADMIN) {
            throw new ForbiddenException("Only users can create tickets");
        }
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Ticket ticket = TicketMapper.toEntity(request, userId);
        ticketRepository.save(ticket);
        return TicketMapper.toResponse(ticket, List.of(), resolveUserName(ticket.getCreatedByUserId()));
    }

    @Override
    public List<TicketResponse> getMyTickets() {
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        return ticketRepository.findByCreatedByUserId(userId).stream()
            .map(ticket -> TicketMapper.toResponse(ticket, getCommentsForTicket(ticket.getId()), resolveUserName(ticket.getCreatedByUserId())))
                .toList();
    }

    @Override
    public List<TicketResponse> getAssignedTickets() {
        Role role = SecurityUtils.getCurrentUserRole()
                .orElseThrow(() -> new ForbiddenException("Not authenticated"));
        if (role != Role.TECHNICIAN) {
            throw new ForbiddenException("Technician privileges required");
        }
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        return ticketRepository.findByAssignedTechnicianId(userId).stream()
            .map(ticket -> TicketMapper.toResponse(ticket, getCommentsForTicket(ticket.getId()), resolveUserName(ticket.getCreatedByUserId())))
                .toList();
    }

    @Override
    public List<TicketResponse> getAll() {
        ensureAdmin();
        return ticketRepository.findAll().stream()
            .map(ticket -> TicketMapper.toResponse(ticket, getCommentsForTicket(ticket.getId()), resolveUserName(ticket.getCreatedByUserId())))
                .toList();
    }

    @Override
    public TicketResponse getById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        if (role != Role.ADMIN && !userId.equals(ticket.getCreatedByUserId())
                && !(role == Role.TECHNICIAN && userId.equals(ticket.getAssignedTechnicianId()))) {
            throw new ForbiddenException("Not allowed to view this ticket");
        }
        return TicketMapper.toResponse(ticket, getCommentsForTicket(ticket.getId()), resolveUserName(ticket.getCreatedByUserId()));
    }

    @Override
    public TicketResponse assign(String id, String technicianId) {
        ensureAdmin();
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticket.setAssignedTechnicianId(technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticketRepository.save(ticket);
        notificationService.createNotification(technicianId, "Ticket assigned",
                "A ticket has been assigned to you", NotificationType.TICKET_ASSIGNED, ticket.getId());
        return TicketMapper.toResponse(ticket, getCommentsForTicket(ticket.getId()), resolveUserName(ticket.getCreatedByUserId()));
    }

    @Override
    public TicketResponse updateStatus(String id, TicketStatus status, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        if (role == Role.TECHNICIAN && !userId.equals(ticket.getAssignedTechnicianId())) {
            throw new ForbiddenException("Technician can only update assigned tickets");
        }
        if (role != Role.ADMIN && role != Role.TECHNICIAN) {
            throw new ForbiddenException("Not allowed to update status");
        }
        if (status == TicketStatus.REJECTED && role != Role.ADMIN) {
            throw new ForbiddenException("Only admins can reject tickets");
        }
        if (status == TicketStatus.REJECTED && (resolutionNotes == null || resolutionNotes.isBlank())) {
            throw new BadRequestException("Rejection reason is required");
        }
        ticket.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            ticket.setResolutionNotes(resolutionNotes.trim());
        }
        ticketRepository.save(ticket);
        notificationService.createNotification(ticket.getCreatedByUserId(), "Ticket status updated",
                "Ticket status changed to " + status.name(), NotificationType.TICKET_STATUS, ticket.getId());
        return TicketMapper.toResponse(ticket, getCommentsForTicket(ticket.getId()), resolveUserName(ticket.getCreatedByUserId()));
    }

    @Override
    public TicketResponse updateResolution(String id, String notes) {
        if (notes == null || notes.isBlank()) {
            throw new BadRequestException("Resolution notes required");
        }
        TicketResponse response = updateStatus(id, TicketStatus.RESOLVED, notes);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        notificationService.createNotification(ticket.getCreatedByUserId(), "Ticket resolved",
                "Ticket has been resolved", NotificationType.TICKET_STATUS, ticket.getId());
        return response;
    }

    private String resolveUserName(String userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse(userId);
    }

    private List<CommentResponse> getCommentsForTicket(String ticketId) {
        List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return comments.stream()
                .map(comment -> CommentMapper.toResponse(comment, resolveUserName(comment.getAuthorId())))
                .toList();
    }

    private void ensureAdmin() {
        Role role = SecurityUtils.getCurrentUserRole()
                .orElseThrow(() -> new ForbiddenException("Not authenticated"));
        if (role != Role.ADMIN) {
            throw new ForbiddenException("Admin privileges required");
        }
    }
}
