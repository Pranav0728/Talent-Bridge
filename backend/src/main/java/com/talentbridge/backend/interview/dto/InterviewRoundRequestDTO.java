package com.talentbridge.backend.interview.dto;

import com.talentbridge.backend.interview.model.InterviewMode;
import com.talentbridge.backend.interview.model.RoundType;

import java.time.LocalDateTime;

public class InterviewRoundRequestDTO {
    private Long jobId;
    private Long candidateId;
    private String roundName;
    private RoundType roundType;
    private String description;
    private LocalDateTime scheduledAt;
    private InterviewMode mode;
    private String locationOrLink;

    // Constructors
    public InterviewRoundRequestDTO() {}

    public InterviewRoundRequestDTO(Long jobId, Long candidateId, String roundName, 
                                   RoundType roundType, String description, LocalDateTime scheduledAt, 
                                   InterviewMode mode, String locationOrLink) {
        this.jobId = jobId;
        this.candidateId = candidateId;
        this.roundName = roundName;
        this.roundType = roundType;
        this.description = description;
        this.scheduledAt = scheduledAt;
        this.mode = mode;
        this.locationOrLink = locationOrLink;
    }

    // Getters and Setters
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

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
}