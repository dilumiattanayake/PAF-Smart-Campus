package com.sliit.smartcampus.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Smart Campus Operations Hub API",
                version = "1.0",
                description = "REST API backend for Smart Campus Operations Hub"
        )
)
public class OpenApiConfig {
}
