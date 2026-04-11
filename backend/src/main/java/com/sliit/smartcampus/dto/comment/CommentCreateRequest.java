package com.sliit.smartcampus.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentCreateRequest {
    @NotBlank
    @Size(max = 100)
    private String content;
}
