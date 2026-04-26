package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.comment.CommentCreateRequest;
import com.sliit.smartcampus.dto.comment.CommentResponse;
import com.sliit.smartcampus.dto.comment.CommentUpdateRequest;

import java.util.List;

public interface CommentService {
    CommentResponse addComment(String ticketId, CommentCreateRequest request);
    List<CommentResponse> getComments(String ticketId);
    CommentResponse updateComment(String ticketId, String commentId, CommentUpdateRequest request);
    void deleteComment(String ticketId, String commentId);
}
