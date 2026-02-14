package com.talentbridge.backend.userJobs.model;

// Simple POJO/DTO - not a JPA entity to avoid conflicts with UserJobModel
public class JobApplication {
    
    private Long id;
    private Long userId;
    private Long jobId;
    private ApplicationStatus status;
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
}