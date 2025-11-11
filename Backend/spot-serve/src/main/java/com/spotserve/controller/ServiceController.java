package com.spotserve.controller;

import com.spotserve.model.ServiceEntity;
import com.spotserve.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    // ✅ Get all available services
    @GetMapping
    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    // ✅ Optional: Add new service (for seeding)
    @PostMapping
    public ServiceEntity addService(@RequestBody ServiceEntity service) {
        return serviceRepository.save(service);
    }
}
