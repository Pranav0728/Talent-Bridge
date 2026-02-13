package com.talentbridge.backend.ai.controller;

import com.talentbridge.backend.ai.dto.SkillGuidanceRequestDTO;
import com.talentbridge.backend.ai.dto.SkillGuidanceResponseDTO;
import com.talentbridge.backend.ai.service.AiSkillGuidanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiSkillGuidanceController {

    @Autowired
    private AiSkillGuidanceService aiSkillGuidanceService;

    @PostMapping("/skill-guidance")
    public ResponseEntity<SkillGuidanceResponseDTO> getSkillGuidance(@RequestBody SkillGuidanceRequestDTO request) {
        try {
            SkillGuidanceResponseDTO response = aiSkillGuidanceService.getSkillGuidance(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Return fallback response if anything goes wrong
            SkillGuidanceResponseDTO fallbackResponse = generateFallbackResponse(request.getSkill(), request.getCurrentMatchScore());
            return ResponseEntity.ok(fallbackResponse);
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