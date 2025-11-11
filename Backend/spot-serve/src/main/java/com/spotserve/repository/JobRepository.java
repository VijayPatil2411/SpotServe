package com.spotserve.repository;

import com.spotserve.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // ✅ Find all jobs created by a specific customer
    List<Job> findByCustomerId(Long customerId);

    // ✅ Find all jobs assigned to a specific mechanic (for later use)
    List<Job> findByMechanicId(Long mechanicId);

    // ✅ Optional: find jobs by status
    List<Job> findByStatus(String status);
}
