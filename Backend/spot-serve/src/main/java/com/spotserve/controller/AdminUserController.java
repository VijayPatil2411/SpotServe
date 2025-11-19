package com.spotserve.controller;

import com.spotserve.model.User;
import com.spotserve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    // ✅ Return ALL CUSTOMERS (role = CUSTOMER)
    @GetMapping
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<User> customers = userRepository.findAll()
                .stream()
                .filter(u -> "CUSTOMER".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(customers);
    }
}
