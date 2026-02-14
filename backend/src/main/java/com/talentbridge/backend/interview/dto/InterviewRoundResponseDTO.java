package com.talentbridge.backend.interview.dto;

import com.talentbridge.backend.interview.model.InterviewMode;
import com.talentbridge.backend.interview.model.RoundStatus;
import com.talentbridge.backend.interview.model.RoundType;

import java.time.LocalDateTime;

public class InterviewRoundResponseDTO {
    private Long id;
    private Long jobId;
    private Long recruiterId;
    private Long candidateId;
    private String roundName;
    private RoundType roundType;
    private String description;
    private LocalDateTime scheduledAt;
    private InterviewMode mode;
    private String locationOrLink;
    private RoundStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String jobTitle;
    private String companyName;
    private String candidateName;
    private String candidateEmail;

    // Constructors
    public InterviewRoundResponseDTO() {}

    public InterviewRoundResponseDTO(Long id, Long jobId, Long recruiterId, Long candidateId, 
                                   String roundName, RoundType roundType, String description, 
                                   LocalDateTime scheduledAt, InterviewMode mode, String locationOrLink, 
                                   RoundStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.jobId = jobId;
        this.recruiterId = recruiterId;
        this.candidateId = candidateId;
        this.roundName = roundName;
        this.roundType = roundType;
        this.description = description;
        this.scheduledAt = scheduledAt;
        this.mode = mode;
        this.locationOrLink = locationOrLink;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }

    public RoundType getRoundType() { return roundType; }
    public void setRoundType(RoundType roundType) { this.roundType = roundType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public InterviewMode getMode() { return mode; }
    public void setMode(InterviewMode mode) { this.mode = mode; }

    public String getLocationOrLink() { return locationOrLink; }
    public void setLocationOrLink(String locationOrLink) { this.locationOrLink = locationOrLink; }

    public RoundStatus getStatus() { return status; }
    public void setStatus(RoundStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
}