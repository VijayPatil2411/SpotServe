package com.spotserve.controller;

import com.spotserve.service.GoogleOAuthService;
import com.spotserve.service.GoogleOAuthService.GoogleAuthResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/auth/google")
@CrossOrigin(origins = "*")
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String clientId;

    @Value("${app.oauth2.redirectUri:http://localhost:8080/api/auth/google/callback}")
    private String redirectUri;

    public GoogleOAuthController(GoogleOAuthService googleOAuthService) {
        this.googleOAuthService = googleOAuthService;
    }

    /**
     * Redirects to Google's OAuth consent screen.
     * Your frontend opens this endpoint in a popup.
     */
    @GetMapping("/authorize")
    public void authorize(HttpServletResponse response,
                          @RequestParam(value = "popup", required = false) String popup) throws IOException {

        if (clientId == null || clientId.isBlank()) {
            response.sendError(500, "Google client id not configured on server");
            return;
        }

        String base = "https://accounts.google.com/o/oauth2/v2/auth";
        String scope = URLEncoder.encode("openid email profile", StandardCharsets.UTF_8);
        String redirect = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);

        String url = base +
                "?client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8) +
                "&response_type=code" +
                "&scope=" + scope +
                "&redirect_uri=" + redirect +
                "&access_type=offline" +
                "&prompt=select_account";

        // redirect the popup to Google consent page
        response.sendRedirect(url);
    }

    /**
     * Callback that Google will call with ?code=...
     * We exchange code -> tokens, create/find user, build JWT and return an HTML
     * page that posts the token back to the opener (frontend) and then closes the popup.
     */
    @GetMapping(value = "/callback", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> callback(@RequestParam("code") String code) {
        try {
            GoogleAuthResult result = googleOAuthService.handleCode(code);

            // Build HTML that posts token+user to the opener window and closes the popup
            // IMPORTANT: targetOrigin should be your frontend origin in production.
            String frontendOrigin = "http://localhost:3000";

            String userJson = String.format("{\"id\":%d,\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}",
                    result.getUser().getId(),
                    safeJs(result.getUser().getName()),
                    safeJs(result.getUser().getEmail()),
                    safeJs(result.getUser().getRole()));

            String html = "<!doctype html>\n" +
                    "<html>\n" +
                    "<head><meta charset='utf-8'><title>Authentication success</title></head>\n" +
                    "<body>\n" +
                    "<script>\n" +
                    "  try {\n" +
                    "    const payload = { token: '" + result.getToken() + "', user: " + userJson + " };\n" +
                    "    // send token to opener window\n" +
                    "    window.opener.postMessage(payload, '" + frontendOrigin + "');\n" +
                    "  } catch (e) { console.error(e); }\n" +
                    "  // close popup after a short delay\n" +
                    "  setTimeout(() => window.close(), 300);\n" +
                    "</script>\n" +
                    "<div style='font-family: Arial, sans-serif; padding: 20px;'>Authentication successful. You can close this window.</div>\n" +
                    "</body>\n" +
                    "</html>";

            return ResponseEntity.ok(html);
        } catch (Exception ex) {
            String errHtml = "<!doctype html><html><body><h3>Authentication failed</h3><p>"
                    + safeJs(ex.getMessage()) + "</p></body></html>";
            return ResponseEntity.status(500).contentType(MediaType.TEXT_HTML).body(errHtml);
        }
    }

    // basic JS-string escaper for small values
    private String safeJs(String v) {
        if (v == null) return "";
        return v.replace("\\", "\\\\").replace("'", "\\'").replace("\"", "\\\"");
    }
}
