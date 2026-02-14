package com.talentbridge.backend.userJobs.controller;

import com.talentbridge.backend.userJobs.model.ApplicationStatus;
import com.talentbridge.backend.userJobs.model.UserJobModel;
import com.talentbridge.backend.userJobs.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/jobApplications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
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

    // Get applications with enhanced interview round status for a job
    @GetMapping("/job/{jobId}/enhanced")
    public List<UserJobModel> getApplicationsWithEnhancedStatusByJob(@PathVariable Long jobId) {
        return jobApplicationService.getApplicationsWithEnhancedStatusByJob(jobId);
    }

    // Get applications with interview rounds count for a user
    @GetMapping("/user/{userId}/enhanced")
    public List<UserJobModel> getApplicationsWithRoundsCountByUserId(@PathVariable Long userId) {
        return jobApplicationService.getApplicationsWithRoundsCountByUserId(userId);
    }

    // Update status of application
    @PutMapping("/status/{applicationId}")
    public UserJobModel updateStatus(@PathVariable Long applicationId,@RequestParam String status) {
        try {
            System.out.println("Received status update request - applicationId: " + applicationId + ", status: " + status);
            
            // Convert string to enum with workaround for database column length
              ApplicationStatus applicationStatus;
              try {
                if ("PROCESS".equals(status.toUpperCase())) {
                  applicationStatus = ApplicationStatus.PROCESS; // Use shorter enum first
                } else {
                  applicationStatus = ApplicationStatus.valueOf(status.toUpperCase());
                }
              } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status value: " + status + ". Valid values are: APPLIED, PROCESS, PROCESS, ACCEPTED, REJECTED");
              }
            
            return jobApplicationService.updateStatus(applicationId, applicationStatus);
        } catch (RuntimeException e) {
            System.err.println("Error updating application status: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error updating application status: " + e.getMessage());
            throw new RuntimeException("Failed to update application status: " + e.getMessage());
        }
    }

    // Delete application
    @DeleteMapping("/{applicationId}")
    public void deleteApplication(@PathVariable Long applicationId) {
        jobApplicationService.deleteApplication(applicationId);
    }
}
                                      
