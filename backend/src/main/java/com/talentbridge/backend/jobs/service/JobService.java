package com.talentbridge.backend.jobs.service;

import com.talentbridge.backend.jobs.model.Job;
import com.talentbridge.backend.jobs.repo.JobRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    @Autowired
    private JobRepo jobRepo;

    // Create or update job
    public Job saveJob(Job job) {
        return jobRepo.save(job);
    }

    // Get all jobs
    public List<Job> getAllJobs() {
        return jobRepo.findAll();
    }

    // Get job by ID
    public Optional<Job> getJobById(Long id) {
        return jobRepo.findById(id);
    }

    // Get jobs by recruiter ID
    public List<Job> getJobsByRecruiterId(Long recruiterId) {
        return jobRepo.findByRecruiter_RecruiterId(recruiterId);
    }

    // Search jobs by title
    public List<Job> searchJobs(String keyword) {
        return jobRepo.findByJobTitleContainingIgnoreCase(keyword);
    }

    // Delete job
    public void deleteJob(Long id) {
        jobRepo.deleteById(id);
    }
}
