package com.spotserve.controller;

import com.spotserve.model.User;
import com.spotserve.repository.UserRepository;
import com.spotserve.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/mechanics")
@CrossOrigin(origins = "*")
public class AdminMechanicController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ 1. Fetch all mechanics + summary
    @GetMapping
    public ResponseEntity<?> getAllMechanics(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<User> mechanics = userRepository.findAll()
                .stream()
                .filter(u -> "MECHANIC".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());

        List<Map<String, Object>> mechanicData = new ArrayList<>();

        for (User mechanic : mechanics) {
            long completed = jobRepository.findByMechanicId(mechanic.getId()).stream()
                    .filter(job -> "Completed".equalsIgnoreCase(job.getStatus()))
                    .count();

            long ongoing = jobRepository.findByMechanicId(mechanic.getId()).stream()
                    .filter(job -> "Ongoing".equalsIgnoreCase(job.getStatus()))
                    .count();

            long total = completed + ongoing;

            Map<String, Object> data = new HashMap<>();
            data.put("id", mechanic.getId());
            data.put("name", mechanic.getName());
            data.put("email", mechanic.getEmail());
            data.put("phone", mechanic.getPhone());
            data.put("shopName", mechanic.getShopName());
            data.put("address", mechanic.getAddress());
            data.put("latitude", mechanic.getLatitude());
            data.put("longitude", mechanic.getLongitude());
            data.put("completedJobs", completed);
            data.put("ongoingJobs", ongoing);
            data.put("totalJobs", total);
            mechanicData.add(data);
        }

        return ResponseEntity.ok(mechanicData);
    }

    // ✅ 2. Add new mechanic (only admin)
    @PostMapping
    public ResponseEntity<?> addMechanic(@RequestBody User newMechanic,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        // Prevent duplicate email
        if (userRepository.findByEmail(newMechanic.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // Set default role and timestamp
        newMechanic.setRole("MECHANIC");
        newMechanic.setCreatedAt(Instant.now());

        // ✅ Handle latitude & longitude safely
        if (newMechanic.getLatitude() == null) newMechanic.setLatitude(0.0);
        if (newMechanic.getLongitude() == null) newMechanic.setLongitude(0.0);

        // Encrypt password
        newMechanic.setPassword(passwordEncoder.encode(newMechanic.getPassword()));

        // Save to DB
        userRepository.save(newMechanic);

        return ResponseEntity.ok(Map.of("message", "Mechanic added successfully!"));
    }
}
