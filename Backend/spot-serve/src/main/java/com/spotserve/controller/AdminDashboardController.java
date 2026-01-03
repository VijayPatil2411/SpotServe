package com.spotserve.controller;

import com.spotserve.model.Job;
import com.spotserve.model.User;
import com.spotserve.model.ServiceEntity;
import com.spotserve.model.Feedback;
import com.spotserve.repository.JobRepository;
import com.spotserve.repository.UserRepository;
import com.spotserve.repository.ServiceRepository;
import com.spotserve.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;  // ✅ NEW

    // ✅ 1. Summary stats for Admin Dashboard
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        long total = jobRepository.count();
        long completed = jobRepository.countByStatus("Completed");
        long pending = jobRepository.countByStatus("Pending");
        long cancelled = jobRepository.countByStatus("Cancelled");
        long accepted = jobRepository.countByStatus("Accepted");
        long ongoing = jobRepository.countByStatus("Ongoing");
        
        // ✅ Corrected KPI counts
        long totalFeedback = feedbackRepository.count();
        long totalUsers = userRepository.countByRole("CUSTOMER");     // only customers
        long totalMechanics = userRepository.countByRole("MECHANIC"); // only mechanics

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("completed", completed);
        stats.put("pending", pending);
        stats.put("cancelled", cancelled);
        stats.put("accepted", accepted);
        stats.put("ongoing", ongoing);
        stats.put("totalUsers", totalUsers);
        stats.put("totalMechanics", totalMechanics);
        stats.put("totalFeedback", totalFeedback);  // ✅ real feedback count
        
        return ResponseEntity.ok(stats);
    }

    // ✅ 2. Get all jobs by status with readable info
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getJobsByStatus(
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body(null);

        List<Job> jobs = jobRepository.findByStatus(status);
        for (Job job : jobs) {
            // 🔹 Attach Service Name
            if (job.getServiceId() != null) {
                ServiceEntity service = serviceRepository.findById(job.getServiceId()).orElse(null);
                if (service != null)
                    job.setServiceName(service.getName());
            }

            // 🔹 Attach Customer Name
            if (job.getCustomerId() != null) {
                User customer = userRepository.findById(job.getCustomerId()).orElse(null);
                if (customer != null)
                    job.setCustomerName(customer.getName());
            }

            // 🔹 Attach Mechanic Name
            if (job.getMechanicId() != null) {
                User mechanic = userRepository.findById(job.getMechanicId()).orElse(null);
                if (mechanic != null)
                    job.setMechanicName(mechanic.getName());
            }
        }

        return ResponseEntity.ok(jobs);
    }
}
