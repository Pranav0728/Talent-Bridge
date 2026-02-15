package com.talentbridge.backend.interview.controller;

import com.talentbridge.backend.interview.dto.InterviewRoundRequestDTO;
import com.talentbridge.backend.interview.dto.InterviewRoundResponseDTO;
import com.talentbridge.backend.interview.dto.InterviewRoundsResponseDTO;
import com.talentbridge.backend.interview.model.RoundStatus;
import com.talentbridge.backend.interview.service.InterviewRoundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview-rounds")
@CrossOrigin(origins = "*")
public class InterviewRoundController {

    @Autowired
    private InterviewRoundService interviewRoundService;

    // Create a new interview round
    @PostMapping("/recruiter/{recruiterId}")
    public ResponseEntity<InterviewRoundResponseDTO> createInterviewRound(
            @PathVariable Long recruiterId,
            @RequestBody InterviewRoundRequestDTO requestDTO) {
        try {
            InterviewRoundResponseDTO response = interviewRoundService.createInterviewRound(recruiterId, requestDTO);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Update round status
    @PutMapping("/{roundId}/recruiter/{recruiterId}/status")
    public ResponseEntity<InterviewRoundResponseDTO> updateRoundStatus(
            @PathVariable Long roundId,
            @PathVariable Long recruiterId,
            @RequestParam RoundStatus status) {
        try {
            InterviewRoundResponseDTO response = interviewRoundService.updateRoundStatus(roundId, recruiterId, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Update interview round details
    @PutMapping("/{roundId}/recruiter/{recruiterId}")
    public ResponseEntity<InterviewRoundResponseDTO> updateInterviewRound(
            @PathVariable Long roundId,
            @PathVariable Long recruiterId,
            @RequestBody InterviewRoundRequestDTO requestDTO) {
        try {
            InterviewRoundResponseDTO response = interviewRoundService.updateInterviewRound(roundId, recruiterId, requestDTO);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get all rounds for a candidate
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<InterviewRoundResponseDTO>> getRoundsByCandidate(@PathVariable Long candidateId) {
        try {
            List<InterviewRoundResponseDTO> rounds = interviewRoundService.getRoundsByCandidate(candidateId);
            return ResponseEntity.ok(rounds);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all rounds for a recruiter
    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<InterviewRoundResponseDTO>> getRoundsByRecruiter(@PathVariable Long recruiterId) {
        try {
            List<InterviewRoundResponseDTO> rounds = interviewRoundService.getRoundsByRecruiter(recruiterId);
            return ResponseEntity.ok(rounds);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all rounds for a specific application (candidate + job)
    @GetMapping("/application/candidate/{candidateId}/job/{jobId}")
    public ResponseEntity<InterviewRoundsResponseDTO> getRoundsForApplication(
            @PathVariable Long candidateId,
            @PathVariable Long jobId) {
        try {
            InterviewRoundsResponseDTO response = interviewRoundService.getRoundsForApplication(candidateId, jobId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all rounds for a job
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<InterviewRoundResponseDTO>> getRoundsByJob(@PathVariable Long jobId) {
        try {
            List<InterviewRoundResponseDTO> rounds = interviewRoundService.getRoundsByJob(jobId);
            return ResponseEntity.ok(rounds);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get rounds by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InterviewRoundResponseDTO>> getRoundsByStatus(@PathVariable RoundStatus status) {
        // This would typically be filtered by user context in a real application
        return ResponseEntity.ok().build();
    }
}