package com.spotserve.receipt;

import com.spotserve.model.User;
import com.spotserve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/jobs")
public class ReceiptController {

    @Autowired
    private ReceiptService receiptService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{jobId}/receipt")
    public ResponseEntity<?> getReceipt(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Fetch customer by email
        User requester = userRepository.findByEmail(userDetails.getUsername())
                .orElse(null);

        if (requester == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            ReceiptDto dto = receiptService.getReceiptForJob(jobId, requester.getId());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(ex.getMessage());
        }
    }
}
