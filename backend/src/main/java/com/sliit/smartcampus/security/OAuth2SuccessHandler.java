package com.sliit.smartcampus.security;

import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        log.info("OAuth2 login successful, handling success redirect");
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        log.info("Processing OAuth2 success for attributes: {}", attributes);

        String emailAttr = (String) attributes.get("email");
        if (emailAttr == null) {
            emailAttr = (String) attributes.get("email_address");
        }
        if (emailAttr == null) {
            emailAttr = (String) attributes.get("sub");
        }

        final String finalEmail = emailAttr;
        log.info("Looking up user by email: {}", finalEmail);

        User user;
        try {
            user = userRepository.findByEmail(finalEmail).orElseThrow(() -> {
                log.error("User with email {} not found in database after OAuth success.", finalEmail);
                return new RuntimeException("Authenticated user not found: " + finalEmail);
            });
        } catch (Exception e) {
            log.error("Error during user lookup in SuccessHandler: {}", e.getMessage(), e);
            response.sendRedirect("http://localhost:5173/login?error=database_lookup_failed");
            return;
        }

        String token = jwtService.generateToken(user);
        String target = redirectUri + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        response.sendRedirect(target);
    }
}
