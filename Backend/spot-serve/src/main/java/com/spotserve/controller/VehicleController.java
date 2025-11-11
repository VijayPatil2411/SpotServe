package com.spotserve.controller;

import com.spotserve.model.User;
import com.spotserve.model.Vehicle;
import com.spotserve.repository.UserRepository;
import com.spotserve.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ 1. Get all vehicles for the logged-in user (used in Add Vehicle page)
    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getUserVehicles(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();

        List<Vehicle> vehicles = vehicleRepository.findByUserId(user.getId());
        return ResponseEntity.ok(vehicles);
    }

    // ✅ 2. Get vehicles by customerId (used in BookRequestModal.jsx)
    @GetMapping("/customer/{customerId}/vehicles")
    public ResponseEntity<List<Vehicle>> getCustomerVehicles(@PathVariable Long customerId) {
        List<Vehicle> vehicles = vehicleRepository.findByUserId(customerId);
        return ResponseEntity.ok(vehicles);
    }

    // ✅ 3. Add new vehicle for logged-in user
    @PostMapping("/vehicles")
    public ResponseEntity<?> addVehicle(@AuthenticationPrincipal UserDetails userDetails,
                                        @RequestBody Vehicle vehicle) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null)
            return ResponseEntity.badRequest().body("User not found");

        vehicle.setUserId(user.getId());
        vehicleRepository.save(vehicle);
        return ResponseEntity.ok("Vehicle added successfully!");
    }
}
