package com.sliit.smartcampus.dto.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentUpdateRequest {
    @NotBlank
    private String content;
}
