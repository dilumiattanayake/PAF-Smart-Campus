package com.sliit.smartcampus.mapper;

import com.sliit.smartcampus.dto.comment.CommentResponse;
import com.sliit.smartcampus.model.Comment;

public final class CommentMapper {
    private CommentMapper() {}

    public static CommentResponse toResponse(Comment comment) {
        if (comment == null) return null;
        return CommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicketId())
                .authorId(comment.getAuthorId())
                .authorRole(comment.getAuthorRole())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
