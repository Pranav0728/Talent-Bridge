package com.talentbridge.backend.jobs.controller;

import com.talentbridge.backend.jobs.model.Job;
import com.talentbridge.backend.jobs.service.JobService;
import com.talentbridge.backend.recruiter.model.Recruiter;
import com.talentbridge.backend.recruiter.repo.RecruiterRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private RecruiterRepo recruiterRepo;

    // Create job for a recruiter
    @PostMapping("/{recruiterId}")
    public ResponseEntity<Job> createJob(@PathVariable Long recruiterId, @RequestBody Job job) {
        Recruiter recruiter = recruiterRepo.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        job.setRecruiter(recruiter); // ✅ set Recruiter entity
        Job savedJob = jobService.saveJob(job);
        return ResponseEntity.ok(savedJob);
    }

    // Update job by ID
    @PutMapping("/{jobId}")
    public ResponseEntity<Job> updateJob(@PathVariable Long jobId, @RequestBody Job updatedJob) {
        return jobService.getJobById(jobId)
                .map(existingJob -> {
                    // Update fields
                    existingJob.setJobTitle(updatedJob.getJobTitle());
                    existingJob.setDescription(updatedJob.getDescription());
                    existingJob.setLocation(updatedJob.getLocation());
                    existingJob.setJob_type(updatedJob.getJob_type());
                    existingJob.setSalary(updatedJob.getSalary());

                    Job savedJob = jobService.saveJob(existingJob);
                    return ResponseEntity.ok(savedJob);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // Get job by ID
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get jobs by recruiter
    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<Job>> getJobsByRecruiter(@PathVariable Long recruiterId) {
        return ResponseEntity.ok(jobService.getJobsByRecruiterId(recruiterId));
    }

    // Search jobs by title
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(@RequestParam String keyword) {
        return ResponseEntity.ok(jobService.searchJobs(keyword));
    }

    // Delete job
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
