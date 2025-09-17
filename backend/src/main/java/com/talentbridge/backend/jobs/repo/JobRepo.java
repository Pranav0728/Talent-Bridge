package com.talentbridge.backend.jobs.repo;

import com.talentbridge.backend.jobs.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepo extends JpaRepository<Job, Long> {
    List<Job> findByRecruiter_RecruiterId(Long recruiterId);
    List<Job> findByJobTitleContainingIgnoreCase(String keyword);
}




