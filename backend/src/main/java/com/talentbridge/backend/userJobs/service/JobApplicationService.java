package com.talentbridge.backend.userJobs.service;

import com.talentbridge.backend.auth.model.Users;
import com.talentbridge.backend.userJobs.model.ApplicationStatus;
import com.talentbridge.backend.userJobs.model.UserJobModel;
import com.talentbridge.backend.userJobs.repo.JobApplicationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.talentbridge.backend.auth.repo.UserRepo;
import com.talentbridge.backend.interview.service.InterviewRoundService;
import org.springframework.transaction.annotation.Transactional;
import com.talentbridge.backend.interview.dto.InterviewRoundsResponseDTO;
import com.talentbridge.backend.interview.dto.InterviewRoundResponseDTO;
import java.util.List;

@Service
public class JobApplicationService {

    @Autowired
    private JobApplicationRepo jobApplicationRepo;

    @Autowired
    private UserRepo usersRepository;

    @Autowired
    private InterviewRoundService interviewRoundService;

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

    public List<UserJobModel> getApplicationsWithRoundsCountByUserId(Long userId) {
        List<UserJobModel> applications = jobApplicationRepo.findByUser_Id(userId);
        // Add interview rounds count to each application
        for (UserJobModel application : applications) {
            try {
                // Validate that user data exists
                if (application.getUser() == null || application.getUser().getId() == null) {
                    System.err.println("Warning: Application " + application.getId() + " has missing user data");
                    application.setInterviewRoundsCount(0);
                    continue;
                }
                
                InterviewRoundsResponseDTO roundsData = interviewRoundService.getRoundsForApplication(application.getUser().getId(), application.getJobId());
                if (roundsData != null && roundsData.getRounds() != null) {
                    application.setInterviewRoundsCount(roundsData.getRounds().size());
                } else {
                    application.setInterviewRoundsCount(0);
                }
            } catch (RuntimeException e) {
                // No rounds found for this application, set count to 0
                System.err.println("No interview rounds found for application " + application.getId() + ": " + e.getMessage());
                application.setInterviewRoundsCount(0);
            } catch (Exception e) {
                // Handle any other unexpected errors
                System.err.println("Error processing application " + application.getId() + ": " + e.getMessage());
                application.setInterviewRoundsCount(0);
            }
        }
        return applications;
    }

    // Get all applications for a job
    public List<UserJobModel> getApplicationsByJob(Long jobId) {
        return jobApplicationRepo.findByJobId(jobId);
    }

    // Get applications with enhanced interview round status for a job
    public List<UserJobModel> getApplicationsWithEnhancedStatusByJob(Long jobId) {
        List<UserJobModel> applications = jobApplicationRepo.findByJobId(jobId);
        // Enhance each application with interview round data
        for (UserJobModel application : applications) {
            try {
                // Validate that user and job data exist
                if (application.getUser() == null || application.getUser().getId() == null) {
                    System.err.println("Warning: Application " + application.getId() + " has missing user data");
                    application.setInterviewRoundsCount(0);
                    continue;
                }
                
                InterviewRoundsResponseDTO roundsData = interviewRoundService.getRoundsForApplication(application.getUser().getId(), application.getJobId());
                
                if (roundsData != null && roundsData.getRounds() != null) {
                    application.setInterviewRoundsCount(roundsData.getRounds().size());
                    
                    // Update application status based on interview rounds if rounds exist
                    if (!roundsData.getRounds().isEmpty()) {
                        // Determine enhanced status based on rounds
                        ApplicationStatus enhancedStatus = determineEnhancedStatus(roundsData.getRounds(), application.getStatus());
                        application.setStatus(enhancedStatus);
                    }
                } else {
                    application.setInterviewRoundsCount(0);
                }
            } catch (RuntimeException e) {
                // No rounds found for this application, keep original status and set count to 0
                System.err.println("No interview rounds found for application " + application.getId() + ": " + e.getMessage());
                application.setInterviewRoundsCount(0);
            } catch (Exception e) {
                // Handle any other unexpected errors
                System.err.println("Error processing application " + application.getId() + ": " + e.getMessage());
                application.setInterviewRoundsCount(0);
            }
        }
        return applications;
    }

    // Determine enhanced status based on interview rounds
    private ApplicationStatus determineEnhancedStatus(List<InterviewRoundResponseDTO> rounds, ApplicationStatus currentStatus) {
        if (rounds == null || rounds.isEmpty()) {
            return currentStatus;
        }

        // Check if any round is rejected
        boolean hasRejected = rounds.stream().anyMatch(round -> round != null && "REJECTED".equals(round.getStatus()));
        if (hasRejected) {
            return ApplicationStatus.REJECTED;
        }

        // Check if all rounds are accepted
        boolean allAccepted = rounds.stream().allMatch(round -> round != null && "ACCEPTED".equals(round.getStatus()));
        if (allAccepted) {
            return ApplicationStatus.ACCEPTED;
        }

        // Check if there's an ongoing round
        boolean hasOngoing = rounds.stream().anyMatch(round -> round != null && "ONGOING".equals(round.getStatus()));
        if (hasOngoing) {
            return ApplicationStatus.PROCESS;
        }

        // Check if waiting for a round
        boolean hasWaiting = rounds.stream().anyMatch(round -> round != null && "WAITING".equals(round.getStatus()));
        if (hasWaiting) {
            return ApplicationStatus.PROCESS;
        }

        // Default: return current status if no specific conditions are met
        return currentStatus;
    }

    // Update status with database constraint handling
    @Transactional
    public UserJobModel updateStatus(Long applicationId, ApplicationStatus status) {        
        System.out.println("Updating application ID: " + applicationId + " to status: " + status);
        
        if (applicationId == null) {
            throw new IllegalArgumentException("Application ID cannot be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        
        UserJobModel application = jobApplicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));

        System.out.println("Found application: " + application.getId() + " current status: " + application.getStatus());
        
        // Validate status transition
        if (application.getStatus() == status) {
            System.out.println("Application already has status: " + status);
            return application;
        }
        
        // Handle database constraint - try different approaches
        try {
            application.setStatus(status);
            UserJobModel updated = jobApplicationRepo.save(application);
            System.out.println("Successfully updated application to status: " + updated.getStatus());
            return updated;
        } catch (Exception e) {
            System.err.println("Database error updating status: " + e.getMessage());
            
            // Try alternative approach - use native query
            try {
                String statusValue = status.name();
                if (status == ApplicationStatus.PROCESS) {
                    statusValue = "PROCESS";
                }
                jobApplicationRepo.updateStatusNative(applicationId, statusValue);
                
                // Refresh the application
                UserJobModel updated = jobApplicationRepo.findById(applicationId)
                        .orElseThrow(() -> new RuntimeException("Application not found after update"));
                System.out.println("Successfully updated application using native query to status: " + updated.getStatus());
                return updated;
            } catch (Exception e2) {
                System.err.println("Native query also failed: " + e2.getMessage());
                throw new RuntimeException("Failed to update application status due to database constraint. Please contact administrator.");
            }
        }
    }
    
    // Helper method to get applications with proper status display
    public List<UserJobModel> getApplicationsByJobId(Long jobId) {
        List<UserJobModel> applications = jobApplicationRepo.findByJobId(jobId);
        // Status is already properly set in the database, no conversion needed here
        return applications;
    }

    // Delete application
    public void deleteApplication(Long applicationId) {
        if (!jobApplicationRepo.existsById(applicationId)) {
            throw new RuntimeException("Application not found with ID: " + applicationId);
        }
        jobApplicationRepo.deleteById(applicationId);
    }
}