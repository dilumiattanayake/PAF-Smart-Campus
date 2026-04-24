package com.sliit.smartcampus.security;

import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.model.enums.Role;
import com.sliit.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;
@Service
@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        log.info("Loading user from OAuth2 provider: {}", userRequest.getClientRegistration().getRegistrationId());
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();
        log.debug("OAuth2 attributes: {}", attributes);

        String email = (String) attributes.getOrDefault("email", attributes.get("email_address"));
        String name = (String) attributes.getOrDefault("name", attributes.get("given_name"));

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email not found in OAuth2 provider response");
        }

        Optional<User> existing;
        try {
            existing = userRepository.findByEmail(email);
            log.info("Found existing user: {}", existing.isPresent());
        } catch (Exception e) {
            log.error("Failed to query database for email {}: {}", email, e.getMessage(), e);
            throw new OAuth2AuthenticationException(new OAuth2Error("db_error"), "Database connection error during OAuth: " + e.getMessage());
        }

        User user;
        try {
            user = existing.orElseGet(() -> {
                log.info("Creating new user for email: {}", email);
                return userRepository.save(User.builder()
                        .fullName(name != null ? name : email)
                        .email(email)
                        .password(UUID.randomUUID().toString())
                        .role(Role.USER)
                        .active(true)
                        .build());
            });
        } catch (Exception e) {
            log.error("Failed to save/update user in database for email {}: {}", email, e.getMessage(), e);
            throw new OAuth2AuthenticationException(new OAuth2Error("db_write_error"), "Database write error during OAuth: " + e.getMessage());
        }

        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                attributes,
                "sub" // principal attribute; not used downstream
        );
    }
}
