package com.talentbridge.backend.ai.service;

import com.talentbridge.backend.ai.dto.SkillGuidanceRequestDTO;
import com.talentbridge.backend.ai.dto.SkillGuidanceResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiSkillGuidanceService {

    @Autowired
    private GroqCloudService groqCloudService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public SkillGuidanceResponseDTO getSkillGuidance(SkillGuidanceRequestDTO request) {
        try {
            // Call GroqCloud API to get AI-generated guidance
            String aiResponse = groqCloudService.generateSkillGuidance(
                request.getSkill(), 
                request.getCurrentMatchScore()
            );

            // Parse the JSON response
            return parseAiResponse(aiResponse, request.getSkill());

        } catch (Exception e) {
            // Return fallback guidance if AI fails
            return generateFallbackGuidance(request.getSkill(), request.getCurrentMatchScore());
        }
    }

    private SkillGuidanceResponseDTO parseAiResponse(String aiResponse, String skill) {
        try {
            // Clean the response - remove any markdown or extra formatting
            String cleanedResponse = cleanJsonResponse(aiResponse);
            
            // Parse JSON
            Map<String, Object> responseMap = objectMapper.readValue(cleanedResponse, Map.class);
            
            // Extract fields with validation
            String importance = getStringValue(responseMap, "importance", "This skill is important for career growth and job opportunities.");
            List<String> learningRoadmap = getListValue(responseMap, "learningRoadmap", Arrays.asList("Learn fundamentals", "Practice with projects", "Apply in real scenarios"));
            String miniTask = getStringValue(responseMap, "miniTask", "Create a simple project demonstrating this skill.");
            String estimatedTime = getStringValue(responseMap, "estimatedTime", "2-4 weeks");
            String priority = getStringValue(responseMap, "priority", "Medium");
            int matchIncrease = getIntValue(responseMap, "matchIncrease", 10);
            List<String> interviewTips = getListValue(responseMap, "interviewTips", Arrays.asList("Be ready to explain your experience with this skill", "Prepare examples of projects using this skill"));
            String resumeTip = getStringValue(responseMap, "resumeTip", "Mention this skill in your skills section and provide examples in your experience.");

            return new SkillGuidanceResponseDTO(
                skill,
                importance,
                learningRoadmap,
                miniTask,
                estimatedTime,
                priority,
                matchIncrease,
                interviewTips,
                resumeTip
            );

        } catch (Exception e) {
            // If parsing fails, return fallback
            return generateFallbackGuidance(skill, 0);
        }
    }

    private String cleanJsonResponse(String response) {
        // Remove markdown formatting
        response = response.replaceAll("```json", "").replaceAll("```", "");
        
        // Remove any leading/trailing whitespace
        response = response.trim();
        
        return response;
    }

    private String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        if (value instanceof String && !((String) value).trim().isEmpty()) {
            return (String) value;
        }
        return defaultValue;
    }

    private List<String> getListValue(Map<String, Object> map, String key, List<String> defaultValue) {
        Object value = map.get(key);
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            List<String> stringList = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof String && !((String) item).trim().isEmpty()) {
                    stringList.add((String) item);
                }
            }
            if (!stringList.isEmpty()) {
                return stringList;
            }
        }
        return defaultValue;
    }

    private int getIntValue(Map<String, Object> map, String key, int defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            int intValue = ((Number) value).intValue();
            // Ensure matchIncrease is within reasonable bounds (5-25)
            return Math.max(5, Math.min(25, intValue));
        }
        return defaultValue;
    }

    private SkillGuidanceResponseDTO generateFallbackGuidance(String skill, int currentMatchScore) {
        return new SkillGuidanceResponseDTO(
            skill,
            "This skill is essential for modern development roles and will significantly improve your job prospects.",
            Arrays.asList(
                "Master the fundamentals and core concepts",
                "Build practical projects to gain hands-on experience", 
                "Learn best practices and advanced techniques"
            ),
            "Create a portfolio project that showcases your " + skill + " skills with real-world application.",
            "3-4 weeks",
            "High",
            15,
            Arrays.asList(
                "Explain your experience with " + skill + " in previous projects",
                "Demonstrate problem-solving using this technology"
            ),
            "Add " + skill + " to your skills section and mention specific projects where you used it."
        );
    }
}