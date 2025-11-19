package com.spotserve.controller;

import com.spotserve.model.ServiceEntity;
import com.spotserve.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/services")
@CrossOrigin(origins = "*")
public class AdminServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    // ============================================================
    // ✅ 1. Get All Services
    // ============================================================
    @GetMapping
    public ResponseEntity<List<ServiceEntity>> getAllServices() {
        return ResponseEntity.ok(serviceRepository.findAll());
    }

    // ============================================================
    // ✅ 2. Create New Service
    // ============================================================
    @PostMapping
    public ResponseEntity<?> createService(@RequestBody ServiceEntity service) {
        if (service.getName() == null || service.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Service name is required");
        }
        if (service.getBasePrice() == null || service.getBasePrice() <= 0) {
            return ResponseEntity.badRequest().body("Base price must be greater than 0");
        }

        ServiceEntity saved = serviceRepository.save(service);
        return ResponseEntity.ok(saved);
    }

    // ============================================================
    // ✅ 3. Update Service by ID
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id,
                                           @RequestBody ServiceEntity updatedService) {
        Optional<ServiceEntity> opt = serviceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("Service not found");
        }

        ServiceEntity service = opt.get();
        if (updatedService.getName() != null)
            service.setName(updatedService.getName());

        if (updatedService.getBasePrice() != null && updatedService.getBasePrice() > 0)
            service.setBasePrice(updatedService.getBasePrice());

        serviceRepository.save(service);

        return ResponseEntity.ok(service);
    }

    // ============================================================
    // ❗4. Delete Service
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        Optional<ServiceEntity> opt = serviceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("Service not found");
        }

        serviceRepository.deleteById(id);
        return ResponseEntity.ok("{\"message\": \"Service deleted successfully\"}");
    }
}
