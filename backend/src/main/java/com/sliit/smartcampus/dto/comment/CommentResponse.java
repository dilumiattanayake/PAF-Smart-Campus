package com.sliit.smartcampus.dto.comment;

import com.sliit.smartcampus.model.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class CommentResponse {
    private String id;
    private String ticketId;
    private String authorId;
    private Role authorRole;
    private String content;
    private Instant createdAt;
}
