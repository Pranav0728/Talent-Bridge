package com.talentbridge.backend.ai.dto;

import java.util.List;

public class SkillMatchRequestDTO {
    private List<String> candidateSkills;
    private List<String> jobSkills;

    // Constructors
    public SkillMatchRequestDTO() {}

    public SkillMatchRequestDTO(List<String> candidateSkills, List<String> jobSkills) {
        this.candidateSkills = candidateSkills;
        this.jobSkills = jobSkills;
    }

    // Getters and Setters
    public List<String> getCandidateSkills() {
        return candidateSkills;
    }

    public void setCandidateSkills(List<String> candidateSkills) {
        this.candidateSkills = candidateSkills;
    }

    public List<String> getJobSkills() {
        return jobSkills;
    }

    public void setJobSkills(List<String> jobSkills) {
        this.jobSkills = jobSkills;
    }
}