package com.talentbridge.backend.ai.controller;

import com.talentbridge.backend.ai.dto.SkillGuidanceRequestDTO;
import com.talentbridge.backend.ai.dto.SkillGuidanceResponseDTO;
import com.talentbridge.backend.ai.service.AiSkillGuidanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiSkillGuidanceController {

    @Autowired
    private AiSkillGuidanceService aiSkillGuidanceService;

    @PostMapping("/skill-guidance")
    public ResponseEntity<SkillGuidanceResponseDTO> getSkillGuidance(@RequestBody SkillGuidanceRequestDTO request) {
        System.out.println("AiSkillGuidanceController: Received request for skill: " + request.getSkill() + " with score: " + request.getCurrentMatchScore());
        try {
            SkillGuidanceResponseDTO response = aiSkillGuidanceService.getSkillGuidance(request);
            System.out.println("AiSkillGuidanceController: Successfully generated guidance");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("AiSkillGuidanceController: Error generating guidance: " + e.getMessage());
            // Return fallback response if anything goes wrong
            SkillGuidanceResponseDTO fallbackResponse = generateFallbackResponse(request.getSkill(), request.getCurrentMatchScore());
            return ResponseEntity.ok(fallbackResponse);
        }
    }

    // Test endpoint to verify API is working
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("AI Skill Guidance API is working!");
    }

    // Test endpoint to verify Groq API connection
    @GetMapping("/test-groq")
    public ResponseEntity<java.util.Map<String, Object>> testGroqConnection() {
        try {
            // Test with a simple skill
            SkillGuidanceRequestDTO testRequest = new SkillGuidanceRequestDTO();
            testRequest.setSkill("JavaScript");
            testRequest.setCurrentMatchScore(50);
            
            SkillGuidanceResponseDTO response = aiSkillGuidanceService.getSkillGuidance(testRequest);
            
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("status", "success");
            result.put("message", "Groq API is working");
            result.put("skill", response.getSkill());
            result.put("importance", response.getImportance());
            result.put("priority", response.getPriority());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return ResponseEntity.ok(error);
        }
    }

    private SkillGuidanceResponseDTO generateFallbackResponse(String skill, int currentMatchScore) {
        return new SkillGuidanceResponseDTO(
            skill,
            "This skill is important for career growth and will help you qualify for more opportunities.",
            java.util.Arrays.asList("Learn fundamentals", "Practice with projects", "Apply in real scenarios"),
            "Create a simple project demonstrating this skill.",
            "2-4 weeks",
            "Medium",
            10,
            java.util.Arrays.asList("Be ready to explain your experience", "Prepare project examples"),
            "Mention this skill in your resume with specific examples."
        );
    }
}