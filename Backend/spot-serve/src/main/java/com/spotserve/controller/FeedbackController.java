package com.spotserve.controller;

import com.spotserve.model.Feedback;
import com.spotserve.model.Job;
import com.spotserve.model.User;
import com.spotserve.repository.JobRepository;
import com.spotserve.repository.UserRepository;
import com.spotserve.service.FeedbackService;
import com.spotserve.repository.FeedbackRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;


    // ============================================================
    // ✅ 1. Submit feedback (CUSTOMER)
    // ============================================================
    @PostMapping
    public ResponseEntity<Map<String, Object>> submitFeedback(
            @RequestBody Feedback feedbackRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (userDetails == null) {
                response.put("message", "Unauthorized");
                return ResponseEntity.status(401).body(response);
            }

            User customer = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            if (customer == null) {
                response.put("message", "Customer not found");
                return ResponseEntity.status(404).body(response);
            }

            Feedback savedFeedback = feedbackService.submitFeedback(
                    feedbackRequest.getJobId(),
                    customer.getId(),
                    feedbackRequest.getRating(),
                    feedbackRequest.getComment()
            );

            response.put("message", "Feedback submitted successfully!");
            response.put("feedback", savedFeedback);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            response.put("message", "Error submitting feedback: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }


    // ============================================================
    // ✅ 2. Get job details before submitting feedback
    // ============================================================
    @GetMapping("/job/{jobId}/details")
    public ResponseEntity<Map<String, Object>> getJobDetailsForFeedback(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (userDetails == null) {
                response.put("message", "Unauthorized");
                return ResponseEntity.status(401).body(response);
            }

            User customer = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            if (customer == null) {
                response.put("message", "Customer not found");
                return ResponseEntity.status(404).body(response);
            }

            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isEmpty()) {
                response.put("message", "Job not found");
                return ResponseEntity.status(404).body(response);
            }

            Job job = jobOpt.get();

            if (!job.getCustomerId().equals(customer.getId())) {
                response.put("message", "Unauthorized: Job does not belong to you");
                return ResponseEntity.status(403).body(response);
            }

            if (feedbackService.feedbackExists(jobId)) {
                response.put("message", "Feedback already submitted for this job");
                response.put("alreadySubmitted", true);
                return ResponseEntity.ok(response);
            }

            String mechanicName = "Unknown Mechanic";
            if (job.getMechanicId() != null) {
                mechanicName = userRepository.findById(job.getMechanicId())
                        .map(User::getName)
                        .orElse("Unknown Mechanic");
            }

            response.put("jobId", job.getId());
            response.put("mechanicName", mechanicName);
            response.put("serviceName", job.getServiceName());
            response.put("status", job.getStatus());
            response.put("alreadySubmitted", false);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Error fetching job details: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }


    // ============================================================
    // ✅ 3. Check if feedback exists (PUBLIC)
    // ============================================================
    @GetMapping("/job/{jobId}/exists")
    public ResponseEntity<Map<String, Object>> checkFeedbackExists(@PathVariable Long jobId) {
        Map<String, Object> response = new HashMap<>();
        response.put("exists", feedbackService.feedbackExists(jobId));
        return ResponseEntity.ok(response);
    }


    // ============================================================
    // ✅ 4. Get mechanic feedback (PUBLIC)
    // ============================================================
    @GetMapping("/mechanic/{mechanicId}")
    public ResponseEntity<Map<String, Object>> getMechanicFeedback(@PathVariable Long mechanicId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Feedback> feedbackList = feedbackService.getMechanicFeedback(mechanicId);
            Double averageRating = feedbackService.getMechanicAverageRating(mechanicId);

            response.put("feedback", feedbackList);
            response.put("averageRating", averageRating);
            response.put("totalCount", feedbackList.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Error fetching feedback: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }



    // ==================================================================
    // ⭐⭐⭐ ADMIN ENDPOINTS ⭐⭐⭐
    // ==================================================================

    // ============================================================
    // ✅ 5. Admin – Get all feedback with names
    // ============================================================
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllFeedbackAdmin() {
        List<Feedback> list = feedbackRepository.findAll();

        list.forEach(f -> {
            userRepository.findById(f.getCustomerId())
                    .ifPresent(c -> f.setCustomerName(c.getName()));

            userRepository.findById(f.getMechanicId())
                    .ifPresent(m -> f.setMechanicName(m.getName()));
        });

        return ResponseEntity.ok(list);
    }


    // ============================================================
    // ✅ 6. Admin – Get feedback of a specific job (with names)
    // ============================================================
    @GetMapping("/admin/job/{jobId}")
    public ResponseEntity<?> getFeedbackByJobAdmin(@PathVariable Long jobId) {

        Optional<Feedback> fOpt = feedbackRepository.findByJobId(jobId);
        if (fOpt.isEmpty()) {
            return ResponseEntity.status(404).body("No feedback found for this job");
        }

        Feedback f = fOpt.get();

        userRepository.findById(f.getCustomerId())
                .ifPresent(c -> f.setCustomerName(c.getName()));

        userRepository.findById(f.getMechanicId())
                .ifPresent(m -> f.setMechanicName(m.getName()));

        return ResponseEntity.ok(f);
    }


    // ============================================================
    // ✅ 7. Admin – Get feedback of a mechanic (with names)
    // ============================================================
    @GetMapping("/admin/mechanic/{mechanicId}")
    public ResponseEntity<?> getFeedbackForMechanicAdmin(@PathVariable Long mechanicId) {

        List<Feedback> list = feedbackRepository.findByMechanicId(mechanicId);

        list.forEach(f -> {
            userRepository.findById(f.getCustomerId())
                    .ifPresent(c -> f.setCustomerName(c.getName()));

            userRepository.findById(f.getMechanicId())
                    .ifPresent(m -> f.setMechanicName(m.getName()));
        });

        return ResponseEntity.ok(list);
    }


    // ============================================================
    // ✅ 8. Admin – Delete feedback
    // ============================================================
    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<?> deleteFeedbackAdmin(@PathVariable Long id) {

        if (!feedbackRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Feedback not found");
        }

        feedbackRepository.deleteById(id);
        return ResponseEntity.ok("Feedback deleted successfully");
    }
    
 // ============================================================
 // ✅ PUBLIC – Get latest 10 feedback for homepage
 // ============================================================
 @GetMapping("/public/recent")
 public ResponseEntity<?> getRecentFeedback() {
     List<Feedback> list = feedbackRepository
             .findTop10ByOrderByCreatedAtDesc();

     // Add names for UI display
     list.forEach(fb -> {
         userRepository.findById(fb.getCustomerId())
                 .ifPresent(user -> fb.setCustomerName(user.getName()));
         userRepository.findById(fb.getMechanicId())
                 .ifPresent(user -> fb.setMechanicName(user.getName()));
     });

     return ResponseEntity.ok(list);
 }

}
