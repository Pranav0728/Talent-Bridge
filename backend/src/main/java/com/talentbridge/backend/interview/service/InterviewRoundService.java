package com.talentbridge.backend.interview.service;

import com.talentbridge.backend.interview.dto.InterviewRoundRequestDTO;
import com.talentbridge.backend.interview.dto.InterviewRoundResponseDTO;
import com.talentbridge.backend.interview.dto.InterviewRoundsResponseDTO;
import com.talentbridge.backend.interview.model.InterviewMode;
import com.talentbridge.backend.interview.model.InterviewRound;
import com.talentbridge.backend.interview.model.RoundStatus;
import com.talentbridge.backend.interview.repository.InterviewRoundRepository;
import com.talentbridge.backend.jobs.model.Job;
import com.talentbridge.backend.jobs.repo.JobRepo;
import com.talentbridge.backend.notification.service.EmailService;
import com.talentbridge.backend.recruiter.model.Recruiter;
import com.talentbridge.backend.recruiter.service.RecruiterService;
import com.talentbridge.backend.userProfile.model.UserProfileModel;
import com.talentbridge.backend.userProfile.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class InterviewRoundService {

    @Autowired
    private InterviewRoundRepository interviewRoundRepository;

    @Autowired
    private JobRepo jobRepository;

    @Autowired
    private RecruiterService recruiterService;

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private EmailService emailService;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM, hh:mm a");

    // Create a new interview round
    public InterviewRoundResponseDTO createInterviewRound(Long recruiterId, InterviewRoundRequestDTO requestDTO) {
        // Validate that the recruiter exists
        Recruiter recruiter = recruiterService.getRecruiterById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter not found with ID: " + recruiterId));

        // Validate that the job exists and belongs to the recruiter
        Job job = jobRepository.findById(requestDTO.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + requestDTO.getJobId()));

        if (!job.getRecruiter().getRecruiterId().equals(recruiterId)) {
            throw new RuntimeException("Job does not belong to this recruiter");
        }

        // Check if candidate has any rejected rounds - if so, don't allow new rounds
        if (interviewRoundRepository.existsByCandidateIdAndJobIdAndStatus(
                requestDTO.getCandidateId(), requestDTO.getJobId(), RoundStatus.REJECTED)) {
            throw new RuntimeException("Cannot create new rounds for a rejected candidate");
        }

        // Create the interview round
        InterviewRound interviewRound = new InterviewRound(
                requestDTO.getJobId(),
                recruiterId,
                requestDTO.getCandidateId(),
                requestDTO.getRoundName(),
                requestDTO.getRoundType(),
                requestDTO.getDescription(),
                requestDTO.getScheduledAt(),
                requestDTO.getMode(),
                requestDTO.getLocationOrLink(),
                RoundStatus.WAITING
        );

        InterviewRound savedRound = interviewRoundRepository.save(interviewRound);

        // Send email notification
        try {
            UserProfileModel candidateProfile = userProfileService.getProfileByUserId(requestDTO.getCandidateId());
            String scheduledDate = requestDTO.getScheduledAt().format(dateFormatter);
            
            emailService.sendNewRoundEmail(
                    candidateProfile.getEmail(),
                    candidateProfile.getFirstName() + " " + candidateProfile.getLastName(),
                    job.getJobTitle(),
                    recruiter.getCompany_name(),
                    requestDTO.getRoundName(),
                    scheduledDate,
                    requestDTO.getMode().toString(),
                    requestDTO.getLocationOrLink()
            );
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }

        return convertToResponseDTO(savedRound);
    }

    // Update round status
    public InterviewRoundResponseDTO updateRoundStatus(Long roundId, Long recruiterId, RoundStatus newStatus) {
        InterviewRound round = interviewRoundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("Interview round not found with ID: " + roundId));

        // Verify that the recruiter owns this round
        if (!round.getRecruiterId().equals(recruiterId)) {
            throw new RuntimeException("You don't have permission to update this round");
        }

        // Update the status
        round.setStatus(newStatus);
        InterviewRound updatedRound = interviewRoundRepository.save(round);

        // Send email notification
        try {
            UserProfileModel candidateProfile = userProfileService.getProfileByUserId(round.getCandidateId());
            Job job = jobRepository.findById(round.getJobId())
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            Recruiter recruiter = recruiterService.getRecruiterById(recruiterId)
                    .orElseThrow(() -> new RuntimeException("Recruiter not found"));
            
            String scheduledDate = round.getScheduledAt().format(dateFormatter);
            
            emailService.sendInterviewRoundEmail(
                    candidateProfile.getEmail(),
                    candidateProfile.getFirstName() + " " + candidateProfile.getLastName(),
                    job.getJobTitle(),
                    recruiter.getCompany_name(),
                    round.getRoundName(),
                    newStatus.toString(),
                    scheduledDate,
                    round.getMode().toString(),
                    round.getLocationOrLink()
            );
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }

        return convertToResponseDTO(updatedRound);
    }

    // Get all rounds for a candidate
    public List<InterviewRoundResponseDTO> getRoundsByCandidate(Long candidateId) {
        return interviewRoundRepository.findByCandidateIdOrderByScheduledAt(candidateId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Get all rounds for a recruiter
    public List<InterviewRoundResponseDTO> getRoundsByRecruiter(Long recruiterId) {
        return interviewRoundRepository.findByRecruiterIdOrderByScheduledAt(recruiterId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Get all rounds for a specific candidate and job (for application tracking)
    public InterviewRoundsResponseDTO getRoundsForApplication(Long candidateId, Long jobId) {
        List<InterviewRound> rounds = interviewRoundRepository.findByCandidateIdAndJobIdOrderByScheduledAt(candidateId, jobId);
        
        if (rounds.isEmpty()) {
            // Return empty response instead of throwing exception
            InterviewRoundsResponseDTO emptyResponse = new InterviewRoundsResponseDTO();
            emptyResponse.setCandidateName("Unknown");
            emptyResponse.setJobTitle("Unknown");
            emptyResponse.setCompanyName("Unknown");
            emptyResponse.setTotalRounds(0);
            emptyResponse.setCompletedRounds(0);
            emptyResponse.setAcceptedRounds(0);
            emptyResponse.setRejectedRounds(0);
            emptyResponse.setOverallApplicationStatus("No Rounds");
            emptyResponse.setRounds(new ArrayList<>());
            return emptyResponse;
        }

        InterviewRound firstRound = rounds.get(0);
        
        // Get job and candidate details with error handling
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        Recruiter recruiter = recruiterService.getRecruiterById(firstRound.getRecruiterId())
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
        UserProfileModel candidateProfile = userProfileService.getProfileByUserId(candidateId);

        // Calculate statistics
        int totalRounds = rounds.size();
        int acceptedRounds = (int) rounds.stream().filter(r -> r.getStatus() == RoundStatus.ACCEPTED).count();
        int rejectedRounds = (int) rounds.stream().filter(r -> r.getStatus() == RoundStatus.REJECTED).count();
        int completedRounds = acceptedRounds + rejectedRounds;

        // Determine overall application status
        String overallStatus = "In Progress";
        if (rejectedRounds > 0) {
            overallStatus = "Rejected";
        } else if (acceptedRounds == totalRounds && totalRounds > 0) {
            overallStatus = "Selected";
        }

        // Create response
        InterviewRoundsResponseDTO response = new InterviewRoundsResponseDTO();
        response.setCandidateName(candidateProfile.getFirstName() + " " + candidateProfile.getLastName());
        response.setJobTitle(job.getJobTitle());
        response.setCompanyName(recruiter.getCompany_name());
        response.setTotalRounds(totalRounds);
        response.setCompletedRounds(completedRounds);
        response.setAcceptedRounds(acceptedRounds);
        response.setRejectedRounds(rejectedRounds);
        response.setOverallApplicationStatus(overallStatus);
        response.setRounds(rounds.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList()));

        return response;
    }

    // Get rounds by job
    public List<InterviewRoundResponseDTO> getRoundsByJob(Long jobId) {
        return interviewRoundRepository.findByJobIdOrderByScheduledAt(jobId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Helper method to convert entity to DTO
    private InterviewRoundResponseDTO convertToResponseDTO(InterviewRound round) {
        InterviewRoundResponseDTO dto = new InterviewRoundResponseDTO(
                round.getId(),
                round.getJobId(),
                round.getRecruiterId(),
                round.getCandidateId(),
                round.getRoundName(),
                round.getRoundType(),
                round.getDescription(),
                round.getScheduledAt(),
                round.getMode(),
                round.getLocationOrLink(),
                round.getStatus(),
                round.getCreatedAt(),
                round.getUpdatedAt()
        );

        // Enrich with additional data
        try {
            Job job = jobRepository.findById(round.getJobId()).orElse(null);
            if (job != null) {
                dto.setJobTitle(job.getJobTitle());
                
                Recruiter recruiter = recruiterService.getRecruiterById(round.getRecruiterId()).orElse(null);
                if (recruiter != null) {
                    dto.setCompanyName(recruiter.getCompany_name());
                }
            }

            UserProfileModel candidate = userProfileService.getProfileByUserId(round.getCandidateId());
            dto.setCandidateName(candidate.getFirstName() + " " + candidate.getLastName());
            dto.setCandidateEmail(candidate.getEmail());
        } catch (Exception e) {
            System.err.println("Error enriching round data: " + e.getMessage());
        }

        return dto;
    }
}