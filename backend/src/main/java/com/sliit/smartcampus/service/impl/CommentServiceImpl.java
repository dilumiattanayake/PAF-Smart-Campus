package com.sliit.smartcampus.service.impl;

import com.sliit.smartcampus.dto.comment.CommentCreateRequest;
import com.sliit.smartcampus.dto.comment.CommentResponse;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.CommentMapper;
import com.sliit.smartcampus.model.Comment;
import com.sliit.smartcampus.model.Ticket;
import com.sliit.smartcampus.model.enums.NotificationType;
import com.sliit.smartcampus.model.enums.Role;
import com.sliit.smartcampus.repository.CommentRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import com.sliit.smartcampus.service.CommentService;
import com.sliit.smartcampus.service.NotificationService;
import com.sliit.smartcampus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    @Override
    public CommentResponse addComment(String ticketId, CommentCreateRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);

        boolean allowed = role == Role.ADMIN
                || (role == Role.USER && userId.equals(ticket.getCreatedByUserId()))
                || (role == Role.TECHNICIAN && userId.equals(ticket.getAssignedTechnicianId()));
        if (!allowed) {
            throw new ForbiddenException("Not allowed to comment on this ticket");
        }

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .authorId(userId)
                .authorRole(role)
                .content(request.getContent())
                .build();
        commentRepository.save(comment);

        notifyParticipants(ticket, userId);
        return CommentMapper.toResponse(comment);
    }

    @Override
    public List<CommentResponse> getComments(String ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(CommentMapper::toResponse)
                .toList();
    }

    private void notifyParticipants(Ticket ticket, String authorId) {
        List<String> targets = new ArrayList<>();
        if (ticket.getCreatedByUserId() != null && !ticket.getCreatedByUserId().equals(authorId)) {
            targets.add(ticket.getCreatedByUserId());
        }
        if (ticket.getAssignedTechnicianId() != null && !ticket.getAssignedTechnicianId().equals(authorId)) {
            targets.add(ticket.getAssignedTechnicianId());
        }
        for (String target : targets) {
            notificationService.createNotification(target, "New ticket comment",
                    "A new comment was added to ticket " + ticket.getId(),
                    NotificationType.COMMENT, ticket.getId());
        }
    }
}
