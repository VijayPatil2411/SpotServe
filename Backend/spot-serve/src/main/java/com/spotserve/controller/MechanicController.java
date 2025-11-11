package com.spotserve.controller;

import com.spotserve.model.Job;
import com.spotserve.model.User;
import com.spotserve.repository.JobRepository;
import com.spotserve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import static java.lang.Math.*;

@RestController
@RequestMapping("/api/mechanic")
@CrossOrigin(origins = "*")
public class MechanicController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    private static final double EARTH_RADIUS_KM = 6371.0;

    // --- Helper for Haversine distance formula ---
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = toRadians(lat2 - lat1);
        double dLon = toRadians(lon2 - lon1);
        lat1 = toRadians(lat1);
        lat2 = toRadians(lat2);
        double a = sin(dLat / 2) * sin(dLat / 2)
                + sin(dLon / 2) * sin(dLon / 2) * cos(lat1) * cos(lat2);
        double c = 2 * atan2(sqrt(a), sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    // ✅ Get nearby jobs (within 10km)
    @GetMapping("/available-jobs")
    public ResponseEntity<?> getNearbyJobs(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.status(404).body("Mechanic not found");

        if (mechanic.getLatitude() == null || mechanic.getLongitude() == null)
            return ResponseEntity.badRequest().body("Mechanic location not set");

        List<Job> pendingJobs = jobRepository.findByStatus("Pending");
        List<Map<String, Object>> nearbyJobs = new ArrayList<>();

        for (Job job : pendingJobs) {
            if (job.getPickupLat() == null || job.getPickupLng() == null)
                continue;

            double distance = calculateDistance(
                    mechanic.getLatitude(),
                    mechanic.getLongitude(),
                    job.getPickupLat(),
                    job.getPickupLng()
            );

            if (distance <= 10.0) { // within 10 km radius
                Map<String, Object> map = new HashMap<>();
                map.put("id", job.getId());
                map.put("description", job.getDescription());
                map.put("distanceKm", String.format("%.2f", distance));
                map.put("status", job.getStatus());
                map.put("location", job.getLocation());
                map.put("createdAt", job.getCreatedAt());
                nearbyJobs.add(map);
            }
        }

        return ResponseEntity.ok(nearbyJobs);
    }

    // ✅ Mechanic accepts a job
    @PutMapping("/accept-job/{jobId}")
    public ResponseEntity<?> acceptJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.status(404).body("Mechanic not found");

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty())
            return ResponseEntity.status(404).body("Job not found");

        Job job = jobOpt.get();
        if (!"Pending".equalsIgnoreCase(job.getStatus()))
            return ResponseEntity.badRequest().body("Job already taken");

        job.setMechanicId(mechanic.getId());
        job.setStatus("Accepted");
        jobRepository.save(job);

        return ResponseEntity.ok("Job accepted successfully!");
    }

    // ✅ Get jobs assigned to logged-in mechanic
    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.status(404).body("Mechanic not found");

        List<Job> jobs = jobRepository.findByMechanicId(mechanic.getId());
        return ResponseEntity.ok(jobs);
    }
}
