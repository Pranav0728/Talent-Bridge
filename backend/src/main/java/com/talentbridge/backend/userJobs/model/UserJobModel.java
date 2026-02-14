package com.talentbridge.backend.userJobs.model;

import com.talentbridge.backend.auth.model.Users;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_application",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "job_id"}))

public class UserJobModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to the user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    // Job ID (can be linked to a Job entity if exists)
    @Column(nullable = false)
    private Long jobId;

    // Status of application
    @Enumerated(EnumType.STRING)
    @Column(length = 20) // Increase column length to handle PROCESS
    private ApplicationStatus status; // APPLIED, PROCESS, ACCEPTED, REJECTED

    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ---------------- Getters & Setters ----------------
    public Long getId() { return id; }
    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { 
        this.status = status; 
    }
    
    // Helper method for database compatibility
    public void setStatusString(String statusStr) {
        if ("PROCESS".equals(statusStr)) {
            this.status = ApplicationStatus.PROCESS;
        } else {
            this.status = ApplicationStatus.valueOf(statusStr);
        }
    }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Transient field for interview rounds count
    @Transient
    private int interviewRoundsCount;

    public int getInterviewRoundsCount() { return interviewRoundsCount; }
    public void setInterviewRoundsCount(int interviewRoundsCount) { this.interviewRoundsCount = interviewRoundsCount; }
}
