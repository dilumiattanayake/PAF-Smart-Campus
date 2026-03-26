package com.sliit.smartcampus.security;

import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.model.enums.Role;
import com.sliit.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.getOrDefault("email", attributes.get("email_address"));
        String name = (String) attributes.getOrDefault("name", attributes.get("given_name"));

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email not found in OAuth2 provider response");
        }

        Optional<User> existing = userRepository.findByEmail(email);
        User user = existing.orElseGet(() -> userRepository.save(User.builder()
                .fullName(name != null ? name : email)
                .email(email)
                // generate placeholder password so the field is non-null; it won't be used for login
                .password(UUID.randomUUID().toString())
                .role(Role.USER)
                .active(true)
                .build()));

        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                attributes,
                "sub" // principal attribute; not used downstream
        );
    }
}
