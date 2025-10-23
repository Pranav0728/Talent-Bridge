package com.talentbridge.backend.userJobs.controller;

import com.talentbridge.backend.userJobs.model.ApplicationStatus;
import com.talentbridge.backend.userJobs.model.UserJobModel;
import com.talentbridge.backend.userJobs.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobApplications")
public class UserJobController {

    @Autowired
    private JobApplicationService jobApplicationService;

    // Apply for a job
    @PostMapping("/apply")
    public UserJobModel applyJob(@RequestParam Long userId, @RequestParam Long jobId) {
        //if already applied, throw exception
        if (jobApplicationService.existsByUserIdAndJobId(userId, jobId)) {
            throw new IllegalArgumentException("User has already applied for this job");
        }
        return jobApplicationService.applyJob(userId, jobId);
    }

    // Get applications for a user
    @GetMapping("/user/{userId}")
    public List<UserJobModel> getApplicationsByUser(@PathVariable Long userId) {
        return jobApplicationService.getApplicationsByUser(userId);
    }

    // Get applications for a job
    @GetMapping("/job/{jobId}")
    public List<UserJobModel> getApplicationsByJob(@PathVariable Long jobId) {
        return jobApplicationService.getApplicationsByJob(jobId);
    }

    // Update status of application
    @PutMapping("/status/{applicationId}")
    public UserJobModel updateStatus(@PathVariable Long applicationId,
                                       @RequestParam ApplicationStatus status) {
        return jobApplicationService.updateStatus(applicationId, status);
    }

    // Delete application
    @DeleteMapping("/{applicationId}")
    public void deleteApplication(@PathVariable Long applicationId) {
        jobApplicationService.deleteApplication(applicationId);
    }
}
