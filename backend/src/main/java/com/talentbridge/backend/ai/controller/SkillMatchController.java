package com.talentbridge.backend.ai.controller;

import com.talentbridge.backend.ai.dto.SkillMatchRequestDTO;
import com.talentbridge.backend.ai.dto.SkillMatchResponseDTO;
import com.talentbridge.backend.ai.service.SkillMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Allows frontend to access this endpoint
public class SkillMatchController {

    @Autowired
    private SkillMatchService skillMatchService;

    @PostMapping("/skill-match")
    public ResponseEntity<SkillMatchResponseDTO> matchSkills(@RequestBody SkillMatchRequestDTO request) {
        SkillMatchResponseDTO response = skillMatchService.calculateMatch(request);
        return ResponseEntity.ok(response);
    }
}