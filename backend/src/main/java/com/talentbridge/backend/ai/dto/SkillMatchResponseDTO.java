package com.talentbridge.backend.ai.dto;

import java.util.List;

public class SkillMatchResponseDTO {
    private int matchPercentage;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String suggestion;

    public SkillMatchResponseDTO() {}

    public SkillMatchResponseDTO(int matchPercentage, List<String> matchedSkills, List<String> missingSkills, String suggestion) {
        this.matchPercentage = matchPercentage;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.suggestion = suggestion;
    }

    // Getters and Setters
    public int getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(int matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }
}