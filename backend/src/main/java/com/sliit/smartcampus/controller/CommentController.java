package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.comment.CommentCreateRequest;
import com.sliit.smartcampus.dto.comment.CommentResponse;
import com.sliit.smartcampus.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> add(@PathVariable String ticketId,
                                               @Valid @RequestBody CommentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(ticketId, request));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> list(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }
}
