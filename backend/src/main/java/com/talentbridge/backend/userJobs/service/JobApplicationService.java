package com.talentbridge.backend.userJobs.service;

import com.talentbridge.backend.auth.model.Users;
import com.talentbridge.backend.userJobs.model.ApplicationStatus;
import com.talentbridge.backend.userJobs.model.UserJobModel;
import com.talentbridge.backend.userJobs.repo.JobApplicationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.talentbridge.backend.auth.repo.UserRepo;

import java.util.List;

@Service
public class JobApplicationService {

    @Autowired
    private JobApplicationRepo jobApplicationRepo;

    @Autowired
    private UserRepo usersRepository;

    // Create a job application

    // Check if user has already applied for the job
    public boolean existsByUserIdAndJobId(Long userId, Long jobId) {
        return jobApplicationRepo.existsByUserIdAndJobId(userId, jobId);
    }

    // Apply for a job
    public UserJobModel applyJob(Long userId, Long jobId) {
        // Check if user has already applied for the job
        if(jobApplicationRepo.existsByUserIdAndJobId(userId, jobId)){
            throw new IllegalArgumentException("User has already applied for this job");
        }

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        UserJobModel application = new UserJobModel();
        application.setUser(user);
        application.setJobId(jobId);
        application.setStatus(ApplicationStatus.APPLIED);

        return jobApplicationRepo.save(application);
        
    }

    // Get all applications for a user
    public List<UserJobModel> getApplicationsByUser(Long userId) {
        return jobApplicationRepo.findByUser_Id(userId);
    }

    // Get all applications for a job
    public List<UserJobModel> getApplicationsByJob(Long jobId) {
        return jobApplicationRepo.findByJobId(jobId);
    }

    // Update status (ACCEPTED or REJECTED)
    public UserJobModel updateStatus(Long applicationId, ApplicationStatus status) {        
        UserJobModel application = jobApplicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        return jobApplicationRepo.save(application);
    }

    // Delete application
    public void deleteApplication(Long applicationId) {
        if (!jobApplicationRepo.existsById(applicationId)) {
            throw new RuntimeException("Application not found with ID: " + applicationId);
        }
        jobApplicationRepo.deleteById(applicationId);
    }
}
