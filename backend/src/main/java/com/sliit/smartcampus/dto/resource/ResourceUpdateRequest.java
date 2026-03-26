package com.sliit.smartcampus.dto.resource;

import com.sliit.smartcampus.model.enums.ResourceStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class ResourceUpdateRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String type;
    @NotBlank
    private String description;
    @NotNull
    @Min(1)
    private Integer capacity;
    @NotBlank
    private String location;
    @NotNull
    private ResourceStatus status;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String imageUrl;
}
