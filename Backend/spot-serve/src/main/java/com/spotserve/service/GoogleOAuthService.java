package com.spotserve.service;

import com.spotserve.config.JwtService;
import com.spotserve.model.User;
import com.spotserve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleOAuthService {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String clientSecret;

    @Value("${app.oauth2.redirectUri:http://localhost:8080/api/auth/google/callback}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public GoogleOAuthService(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Exchange authorization code for tokens and return server JWT + user.
     */
    public GoogleAuthResult handleCode(String code) throws Exception {
        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            throw new Exception("Google client id/secret not configured on server");
        }

        // 1) Exchange code for tokens
        String tokenUrl = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // URL-encode each parameter
        String body = "code=" + URLEncoder.encode(code, StandardCharsets.UTF_8) +
                "&client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8) +
                "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8) +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&grant_type=authorization_code";

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, request, Map.class);
        if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
            throw new Exception("Token exchange failed: " + tokenResponse.getStatusCode());
        }

        Map tokenBody = tokenResponse.getBody();

        // id_token is JWT that includes user info
        String idToken = (String) tokenBody.get("id_token");
        if (idToken == null) throw new Exception("id_token missing from token response");

        // 2) Validate / parse id_token using Google tokeninfo
        String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8);
        ResponseEntity<Map> infoResp = restTemplate.getForEntity(tokenInfoUrl, Map.class);
        if (!infoResp.getStatusCode().is2xxSuccessful() || infoResp.getBody() == null) {
            throw new Exception("Failed to validate id_token");
        }

        Map info = infoResp.getBody();

        // verify audience (aud)
        Object audObj = info.get("aud");
        String aud = audObj != null ? audObj.toString() : null;
        if (aud == null || !aud.equals(clientId)) {
            throw new Exception("Invalid id_token audience");
        }

        String email = info.get("email") != null ? info.get("email").toString() : null;
        String name = info.get("name") != null ? info.get("name").toString() : null;
        Object emailVerifiedObj = info.get("email_verified");

        boolean emailVerified = false;
        if (emailVerifiedObj instanceof Boolean) {
            emailVerified = (Boolean) emailVerifiedObj;
        } else if (emailVerifiedObj != null) {
            emailVerified = "true".equalsIgnoreCase(emailVerifiedObj.toString());
        }

        if (email == null || !emailVerified) {
            throw new Exception("Email not available or not verified by Google");
        }

        // 3) Find or create local user
        Optional<User> opt = userRepository.findByEmail(email);
        User user;
        if (opt.isPresent()) {
            user = opt.get();
            // update name if empty
            if ((user.getName() == null || user.getName().isBlank()) && name != null) {
                user.setName(name);
                userRepository.save(user);
            }
        } else {
            user = new User();
            user.setName(name != null ? name : email);
            user.setEmail(email);
            // set a random password (encoded) because user uses Google to login
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole("CUSTOMER");
            userRepository.save(user);
        }

        // 4) generate app JWT token
        String jwt = jwtService.generateToken(user.getEmail(), user.getRole());

        GoogleAuthResult result = new GoogleAuthResult();
        result.setToken(jwt);
        result.setUser(user);
        return result;
    }

    // Simple holder for result
    public static class GoogleAuthResult {
        private String token;
        private User user;
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }
    }
}
