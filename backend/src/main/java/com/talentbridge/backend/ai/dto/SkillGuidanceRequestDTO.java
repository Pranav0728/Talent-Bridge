package com.talentbridge.backend.ai.dto;

public class SkillGuidanceRequestDTO {
    private String skill;
    private int currentMatchScore;

    public SkillGuidanceRequestDTO() {}

    public SkillGuidanceRequestDTO(String skill, int currentMatchScore) {
        this.skill = skill;
        this.currentMatchScore = currentMatchScore;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public int getCurrentMatchScore() {
        return currentMatchScore;
    }

    public void setCurrentMatchScore(int currentMatchScore) {
        this.currentMatchScore = currentMatchScore;
    }
}