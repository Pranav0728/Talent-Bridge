package com.talentbridge.backend.ai.dto;

import java.util.List;

public class SkillGuidanceResponseDTO {
    private String skill;
    private String importance;
    private List<String> learningRoadmap;
    private String miniTask;
    private String estimatedTime;
    private String priority;
    private int matchIncrease;
    private List<String> interviewTips;
    private String resumeTip;

    public SkillGuidanceResponseDTO() {}

    public SkillGuidanceResponseDTO(String skill, String importance, List<String> learningRoadmap, 
                                  String miniTask, String estimatedTime, String priority, 
                                  int matchIncrease, List<String> interviewTips, String resumeTip) {
        this.skill = skill;
        this.importance = importance;
        this.learningRoadmap = learningRoadmap;
        this.miniTask = miniTask;
        this.estimatedTime = estimatedTime;
        this.priority = priority;
        this.matchIncrease = matchIncrease;
        this.interviewTips = interviewTips;
        this.resumeTip = resumeTip;
    }

    // Getters and Setters
    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getImportance() {
        return importance;
    }

    public void setImportance(String importance) {
        this.importance = importance;
    }

    public List<String> getLearningRoadmap() {
        return learningRoadmap;
    }

    public void setLearningRoadmap(List<String> learningRoadmap) {
        this.learningRoadmap = learningRoadmap;
    }

    public String getMiniTask() {
        return miniTask;
    }

    public void setMiniTask(String miniTask) {
        this.miniTask = miniTask;
    }

    public String getEstimatedTime() {
        return estimatedTime;
    }

    public void setEstimatedTime(String estimatedTime) {
        this.estimatedTime = estimatedTime;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public int getMatchIncrease() {
        return matchIncrease;
    }

    public void setMatchIncrease(int matchIncrease) {
        this.matchIncrease = matchIncrease;
    }

    public List<String> getInterviewTips() {
        return interviewTips;
    }

    public void setInterviewTips(List<String> interviewTips) {
        this.interviewTips = interviewTips;
    }

    public String getResumeTip() {
        return resumeTip;
    }

    public void setResumeTip(String resumeTip) {
        this.resumeTip = resumeTip;
    }
}