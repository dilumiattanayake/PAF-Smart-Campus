package com.sliit.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class SmartCampusBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusBackendApplication.class, args);
    }
}
