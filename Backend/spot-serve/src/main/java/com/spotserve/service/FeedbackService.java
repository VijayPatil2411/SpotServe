package com.spotserve.service;

import com.spotserve.model.Feedback;
import com.spotserve.model.Job;
import com.spotserve.model.User;
import com.spotserve.repository.FeedbackRepository;
import com.spotserve.repository.JobRepository;
import com.spotserve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Submit feedback for a completed job
     */
    public Feedback submitFeedback(Long jobId, Long customerId, Integer rating, String comment) {

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new RuntimeException("Job not found");
        }

        Job job = jobOpt.get();

        if (!job.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Unauthorized: Job does not belong to this customer");
        }

        if (!"Completed".equalsIgnoreCase(job.getStatus())) {
            throw new RuntimeException("Feedback can only be submitted for completed jobs");
        }

        if (feedbackRepository.existsByJobId(jobId)) {
            throw new RuntimeException("Feedback already submitted for this job");
        }

        if (job.getMechanicId() == null) {
            throw new RuntimeException("No mechanic assigned to this job");
        }

        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Feedback feedback = new Feedback();
        feedback.setJobId(jobId);
        feedback.setCustomerId(customerId);
        feedback.setMechanicId(job.getMechanicId());
        feedback.setRating(rating);
        feedback.setComment(comment);

        return feedbackRepository.save(feedback);
    }

    /**
     * Enrich single feedback with names
     */
    public void enrichFeedback(Feedback f) {
        userRepository.findById(f.getCustomerId())
                .ifPresent(c -> f.setCustomerName(c.getName()));

        userRepository.findById(f.getMechanicId())
                .ifPresent(m -> f.setMechanicName(m.getName()));
    }

    /**
     * Get all mechanic feedback enriched
     */
    public List<Feedback> getMechanicFeedback(Long mechanicId) {
        List<Feedback> list = feedbackRepository.findByMechanicId(mechanicId);
        list.forEach(this::enrichFeedback);
        return list;
    }

    public Double getMechanicAverageRating(Long mechanicId) {
        List<Feedback> list = feedbackRepository.findByMechanicId(mechanicId);
        if (list.isEmpty()) return 0.0;

        return list.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
    }

    public boolean feedbackExists(Long jobId) {
        return feedbackRepository.existsByJobId(jobId);
    }
}
