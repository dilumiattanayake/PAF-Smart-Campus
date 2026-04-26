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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private static final int MAX_ATTACHMENTS = 3;
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;
    private static final Map<String, String> EXTENSION_BY_CONTENT_TYPE = Map.of(
            "image/png", ".png",
            "image/jpeg", ".jpg",
            "application/pdf", ".pdf"
    );
    private static final Set<String> ALLOWED_CONTENT_TYPES = EXTENSION_BY_CONTENT_TYPE.keySet();

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.ticket.attachments-dir:uploads/tickets}")
    private String attachmentsDirectory;

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
        notifySupportStaffOnCreate(ticket, userId);
        return TicketMapper.toResponse(ticket, List.of());
    }

    @Override
    public TicketResponse createWithAttachments(TicketCreateRequest request, List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return create(request);
        }
        if (request.getAttachmentUrls() != null && !request.getAttachmentUrls().isEmpty()) {
            throw new BadRequestException("Do not pass attachment URLs when uploading files");
        }
        if (attachments.size() > MAX_ATTACHMENTS) {
            throw new BadRequestException("Up to 3 attachments are allowed");
        }
        request.setAttachmentUrls(storeAttachments(attachments));
        return create(request);
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
    public Resource loadAttachment(String filename) {
        String safeFilename = sanitizeFilename(filename);
        String attachmentUrl = "/api/tickets/attachments/" + safeFilename;
        List<Ticket> tickets = ticketRepository.findByAttachmentUrlsContains(attachmentUrl);
        if (tickets.isEmpty()) {
            throw new ResourceNotFoundException("Attachment not found");
        }

        String userId = SecurityUtils.getCurrentUserId().orElseThrow();
        Role role = SecurityUtils.getCurrentUserRole().orElse(Role.USER);
        boolean authorized = role == Role.ADMIN || tickets.stream().anyMatch(ticket ->
                userId.equals(ticket.getCreatedByUserId())
                        || (role == Role.TECHNICIAN && userId.equals(ticket.getAssignedTechnicianId()))
        );
        if (!authorized) {
            throw new ForbiddenException("Not allowed to access this attachment");
        }

        Path path = Paths.get(attachmentsDirectory).toAbsolutePath().normalize().resolve(safeFilename).normalize();
        if (!Files.exists(path) || !path.startsWith(Paths.get(attachmentsDirectory).toAbsolutePath().normalize())) {
            throw new ResourceNotFoundException("Attachment not found");
        }
        try {
            return new UrlResource(path.toUri());
        } catch (IOException e) {
            throw new ResourceNotFoundException("Attachment not found");
        }
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

    private void notifySupportStaffOnCreate(Ticket ticket, String creatorId) {
        List<User> technicians = userRepository.findByRole(Role.TECHNICIAN);
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (User user : technicians) {
            if (!user.getId().equals(creatorId)) {
                notificationService.createNotification(
                        user.getId(),
                        "New ticket created",
                        "A new ticket requires attention",
                        NotificationType.TICKET,
                        ticket.getId()
                );
            }
        }

        for (User user : admins) {
            if (!user.getId().equals(creatorId)) {
                notificationService.createNotification(
                        user.getId(),
                        "New ticket created",
                        "A new ticket has been submitted",
                        NotificationType.TICKET,
                        ticket.getId()
                );
            }
        }
    }

    private List<String> storeAttachments(List<MultipartFile> attachments) {
        Path uploadRoot = Paths.get(attachmentsDirectory).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new BadRequestException("Unable to initialize upload storage");
        }

        return attachments.stream().map(file -> storeSingleAttachment(file, uploadRoot)).toList();
    }

    private String storeSingleAttachment(MultipartFile file, Path uploadRoot) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Attachment file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("Each attachment must be 10MB or smaller");
        }

        String contentType = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase();
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Only PNG, JPG, and PDF files are allowed");
        }

        String extension = EXTENSION_BY_CONTENT_TYPE.get(contentType);
        String filename = UUID.randomUUID() + extension;
        Path target = uploadRoot.resolve(filename).normalize();
        if (!target.startsWith(uploadRoot)) {
            throw new BadRequestException("Invalid file path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store attachment");
        }
        return "/api/tickets/attachments/" + filename;
    }

    private String sanitizeFilename(String filename) {
        String normalized = StringUtils.cleanPath(filename == null ? "" : filename);
        if (normalized.contains("..") || normalized.contains("/") || normalized.contains("\\")) {
            throw new BadRequestException("Invalid attachment name");
        }
        if (!StringUtils.hasText(normalized)) {
            throw new BadRequestException("Invalid attachment name");
        }
        return normalized;
    }
}
