package com.spotserve.repository;

import com.spotserve.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    Optional<Feedback> findByJobId(Long jobId);
    
    List<Feedback> findByMechanicId(Long mechanicId);
    
    List<Feedback> findByCustomerId(Long customerId);
    
    List<Feedback> findTop10ByOrderByCreatedAtDesc();

    
    boolean existsByJobId(Long jobId);

    // ===== NEW METHODS FOR RATINGS =====
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.mechanicId = :mechanicId")
    Double getAverageRatingByMechanicId(@Param("mechanicId") Long mechanicId);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.mechanicId = :mechanicId")
    Integer countFeedbackByMechanicId(@Param("mechanicId") Long mechanicId);
}
