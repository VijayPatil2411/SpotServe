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

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    /* ======================================================
       ✅ 1. Get all jobs of logged-in customer
    ====================================================== */
    @GetMapping
    public ResponseEntity<List<Job>> getCustomerJobs(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        List<Job> jobs = jobRepository.findByCustomerId(user.getId());
        jobs.forEach(job -> {
            if (job.getService() != null && job.getService().getName() != null)
                job.setServiceName(job.getService().getName());
        });

        return ResponseEntity.ok(jobs);
    }

    /* ======================================================
       ✅ 2. Create new service request
    ====================================================== */
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        try {
            if (job.getServiceId() == null)
                return ResponseEntity.badRequest().body("{\"message\": \"Service ID is required\"}");

            if (job.getCustomerId() == null)
                return ResponseEntity.badRequest().body("{\"message\": \"Customer ID missing\"}");
            if (job.getVehicleId() == null)
                return ResponseEntity.badRequest().body("{\"message\": \"Vehicle ID missing\"}");

            job.setStatus("Pending");
            Job savedJob = jobRepository.save(job);

            return ResponseEntity.ok("{\"message\": \"Service request created successfully!\", \"jobId\": " + savedJob.getId() + "}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("{\"message\": \"Error saving job: " + e.getMessage() + "\"}");
        }
    }

    /* ======================================================
       ✅ 3. Cancel pending job
    ====================================================== */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelJob(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null)
            return ResponseEntity.status(404).body("User not found");

        Job job = jobRepository.findById(id).orElse(null);
        if (job == null)
            return ResponseEntity.status(404).body("Job not found");

        if (!job.getCustomerId().equals(user.getId()))
            return ResponseEntity.status(403).body("Access denied");

        if (!"Pending".equalsIgnoreCase(job.getStatus()))
            return ResponseEntity.badRequest().body("Only pending jobs can be cancelled");

        job.setStatus("Cancelled");
        jobRepository.save(job);
        return ResponseEntity.ok("{\"message\": \"Job cancelled successfully\"}");
    }

    /* ======================================================
       ✅ 4. Available jobs for mechanics
    ====================================================== */
    @GetMapping("/available")
    public ResponseEntity<List<Job>> getAvailableJobsForMechanic(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).build();

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.notFound().build();

        List<Job> pendingJobs = jobRepository.findByStatus("Pending").stream()
                .filter(job -> job.getMechanicId() == null)
                .filter(job -> !"Cancelled".equalsIgnoreCase(job.getStatus()))
                .filter(job -> !"Completed".equalsIgnoreCase(job.getStatus()))
                .collect(Collectors.toList());

        double mechLat = mechanic.getLatitude() != null ? mechanic.getLatitude() : 0.0;
        double mechLng = mechanic.getLongitude() != null ? mechanic.getLongitude() : 0.0;

        for (Job job : pendingJobs) {
            if (job.getPickupLat() != null && job.getPickupLng() != null) {
                double distance = haversine(mechLat, mechLng, job.getPickupLat(), job.getPickupLng());
                job.setDescription((job.getDescription() != null ? job.getDescription() : "")
                        + " (" + String.format("%.2f km away", distance) + ")");
            }
            if (job.getService() != null && job.getService().getName() != null)
                job.setServiceName(job.getService().getName());
        }

        pendingJobs.sort(Comparator.comparingDouble(job -> {
            if (job.getPickupLat() == null || job.getPickupLng() == null)
                return Double.MAX_VALUE;
            return haversine(mechLat, mechLng, job.getPickupLat(), job.getPickupLng());
        }));

        return ResponseEntity.ok(pendingJobs);
    }

    /* ======================================================
       ✅ 5. Mechanic accepts job
    ====================================================== */
    @PutMapping("/{jobId}/accept")
    public ResponseEntity<?> acceptJob(@PathVariable Long jobId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.status(404).body("Mechanic not found");

        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null)
            return ResponseEntity.status(404).body("Job not found");

        if (!"Pending".equalsIgnoreCase(job.getStatus()))
            return ResponseEntity.badRequest().body("Job already accepted or completed");

        job.setStatus("Accepted");
        job.setMechanicId(mechanic.getId());
        jobRepository.save(job);

        return ResponseEntity.ok("{\"message\": \"Job accepted successfully\"}");
    }

    /* ======================================================
       ✅ 6. Get accepted jobs for mechanic
    ====================================================== */
    @GetMapping("/accepted")
    public ResponseEntity<List<Job>> getAcceptedJobs(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).build();

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.notFound().build();

        List<Job> acceptedJobs = jobRepository.findByMechanicId(mechanic.getId());
        acceptedJobs.forEach(job -> {
            if (job.getService() != null && job.getService().getName() != null)
                job.setServiceName(job.getService().getName());
        });

        return ResponseEntity.ok(acceptedJobs);
    }

    /* ======================================================
       ✅ 7. Start Job → Generate OTP (persist)
    ====================================================== */
    @PutMapping("/{jobId}/start")
    public ResponseEntity<?> startJob(@PathVariable Long jobId,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User mechanic = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (mechanic == null)
            return ResponseEntity.status(404).body("Mechanic not found");

        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null)
            return ResponseEntity.status(404).body("Job not found");

        if (!"Accepted".equalsIgnoreCase(job.getStatus()))
            return ResponseEntity.badRequest().body("{\"message\": \"Job not in accepted state\"}");

        // ✅ Do not regenerate if already exists
        if (job.getOtpCode() != null) {
            return ResponseEntity.ok("{\"message\": \"OTP already generated. Ask the customer for it.\"}");
        }

        int otp = (int) (Math.random() * 900000) + 100000;
        job.setOtpCode(String.valueOf(otp));
        jobRepository.save(job);

        return ResponseEntity.ok("{\"message\": \"OTP generated and sent to customer.\"}");
    }

    /* ======================================================
       ✅ 8. Customer fetches OTP
    ====================================================== */
    @GetMapping("/{jobId}/otp")
    public ResponseEntity<?> getCustomerOtp(@PathVariable Long jobId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User customer = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (customer == null)
            return ResponseEntity.status(404).body("Customer not found");

        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null)
            return ResponseEntity.status(404).body("Job not found");

        if (!job.getCustomerId().equals(customer.getId()))
            return ResponseEntity.status(403).body("Access denied");

        if (job.getOtpCode() == null)
            return ResponseEntity.ok("{\"message\": \"No active OTP for this job.\"}");

        return ResponseEntity.ok("{\"otp\": \"" + job.getOtpCode() + "\"}");
    }

    /* ======================================================
       ✅ 9. Verify OTP → Mark as Ongoing
    ====================================================== */
    @PutMapping("/{jobId}/verify-otp")
    public ResponseEntity<?> verifyOtp(@PathVariable Long jobId,
                                       @RequestParam String otp,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null)
            return ResponseEntity.status(404).body("Job not found");

        if (!"Accepted".equalsIgnoreCase(job.getStatus()))
            return ResponseEntity.badRequest().body("{\"message\": \"Job not ready for OTP verification\"}");

        if (!otp.equals(job.getOtpCode()))
            return ResponseEntity.badRequest().body("{\"message\": \"Invalid OTP\"}");

        job.setStatus("Ongoing");
        job.setOtpCode(null);
        jobRepository.save(job);

        return ResponseEntity.ok("{\"message\": \"OTP verified successfully! Job is now ongoing.\"}");
    }

    /* ======================================================
       ✅ 10. Complete Job
    ====================================================== */
    @PutMapping("/{jobId}/complete")
    public ResponseEntity<?> completeJob(@PathVariable Long jobId,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null)
            return ResponseEntity.status(404).body("Job not found");

        if (!"Ongoing".equalsIgnoreCase(job.getStatus()))
            return ResponseEntity.badRequest().body("Job not in progress");

        job.setStatus("Completed");
        jobRepository.save(job);

        return ResponseEntity.ok("{\"message\": \"Job completed successfully\"}");
    }

    /* ======================================================
       ✅ Utility: Haversine distance
    ====================================================== */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
