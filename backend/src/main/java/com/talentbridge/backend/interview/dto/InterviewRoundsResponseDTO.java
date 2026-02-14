package com.talentbridge.backend.interview.dto;

import java.util.List;

public class InterviewRoundsResponseDTO {
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String overallApplicationStatus;
    private int totalRounds;
    private int completedRounds;
    private int acceptedRounds;
    private int rejectedRounds;
    private List<InterviewRoundResponseDTO> rounds;

    // Constructors
    public InterviewRoundsResponseDTO() {}

    public InterviewRoundsResponseDTO(Long jobId, String jobTitle, String companyName, Long candidateId, 
                                     String candidateName, String candidateEmail, String overallApplicationStatus) {
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.overallApplicationStatus = overallApplicationStatus;
    }

    // Getters and Setters
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getOverallApplicationStatus() { return overallApplicationStatus; }
    public void setOverallApplicationStatus(String overallApplicationStatus) { this.overallApplicationStatus = overallApplicationStatus; }

    public int getTotalRounds() { return totalRounds; }
    public void setTotalRounds(int totalRounds) { this.totalRounds = totalRounds; }

    public int getCompletedRounds() { return completedRounds; }
    public void setCompletedRounds(int completedRounds) { this.completedRounds = completedRounds; }

    public int getAcceptedRounds() { return acceptedRounds; }
    public void setAcceptedRounds(int acceptedRounds) { this.acceptedRounds = acceptedRounds; }

    public int getRejectedRounds() { return rejectedRounds; }
    public void setRejectedRounds(int rejectedRounds) { this.rejectedRounds = rejectedRounds; }

    public List<InterviewRoundResponseDTO> getRounds() { return rounds; }
    public void setRounds(List<InterviewRoundResponseDTO> rounds) { this.rounds = rounds; }
}