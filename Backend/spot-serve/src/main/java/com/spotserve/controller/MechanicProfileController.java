package com.spotserve.controller;

import com.spotserve.model.User;
import com.spotserve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mechanic")
@CrossOrigin(origins = "*")
public class MechanicProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /* ======================================================
       ✅ 1. Get Logged-in Mechanic Profile
    ====================================================== */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.status(404).body("Mechanic not found");

        return ResponseEntity.ok(mechanic);
    }

    /* ======================================================
       ✅ 2. Update Mechanic Profile (Name + Password only)
    ====================================================== */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody User updatedUser
    ) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.status(404).body("Mechanic not found");

        // ✅ Update name if provided
        if (updatedUser.getName() != null && !updatedUser.getName().isBlank()) {
            mechanic.setName(updatedUser.getName());
        }

        // ✅ Update password if provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            mechanic.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        userRepository.save(mechanic);
        return ResponseEntity.ok("{\"message\": \"Profile updated successfully!\"}");
    }
}
