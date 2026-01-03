package com.spotserve.controller;

import com.spotserve.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/mechanics/ratings")
@PreAuthorize("hasRole('ADMIN')")
public class RatingController {
    @Autowired
    private FeedbackRepository feedbackRepository;

    @GetMapping("/{mechanicId}")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long mechanicId) {
        Double avgRating = feedbackRepository.getAverageRatingByMechanicId(mechanicId);
        Integer totalRatings = feedbackRepository.countFeedbackByMechanicId(mechanicId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.put("totalRatings", totalRatings != null ? totalRatings : 0);
        
        return ResponseEntity.ok(response);
    }
}
