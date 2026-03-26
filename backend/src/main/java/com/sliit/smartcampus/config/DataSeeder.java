package com.sliit.smartcampus.config;

import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.model.enums.Role;
import com.sliit.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner seedAdmin() {
        return args -> {
            if (!userRepository.existsByRole(Role.ADMIN)) {
                User admin = User.builder()
                        .fullName("Default Admin")
                        .email("admin@smartcampus.edu")
                        .password(passwordEncoder.encode("Admin@123"))
                        .role(Role.ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
            }

            userRepository.findByEmail("user@smartcampus.edu").ifPresentOrElse(u -> {}, () -> {
                User student = User.builder()
                        .fullName("Default User")
                        .email("user@smartcampus.edu")
                        .password(passwordEncoder.encode("User@123"))
                        .role(Role.USER)
                        .active(true)
                        .build();
                userRepository.save(student);
            });

            userRepository.findByEmail("tech@smartcampus.edu").ifPresentOrElse(u -> {}, () -> {
                User technician = User.builder()
                        .fullName("Default Technician")
                        .email("tech@smartcampus.edu")
                        .password(passwordEncoder.encode("Tech@123"))
                        .role(Role.TECHNICIAN)
                        .active(true)
                        .build();
                userRepository.save(technician);
            });
        };
    }
}
