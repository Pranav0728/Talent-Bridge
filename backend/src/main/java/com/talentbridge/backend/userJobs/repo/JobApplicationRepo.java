package com.talentbridge.backend.userJobs.repo;

import com.talentbridge.backend.userJobs.model.UserJobModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepo extends JpaRepository<UserJobModel, Long> {
    // Check if user has already applied for the job
    boolean existsByUserIdAndJobId(Long userId, Long jobId);



    // Find all applications for a user
    List<UserJobModel> findByUser_Id(Long userId);

    // Find all applications for a specific job
    List<UserJobModel> findByJobId(Long jobId);

    // Optional: find by user and job
    UserJobModel findByUser_IdAndJobId(Long userId, Long jobId);
}
