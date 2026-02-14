package com.talentbridge.backend.interview.repository;

import com.talentbridge.backend.interview.model.InterviewRound;
import com.talentbridge.backend.interview.model.RoundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRoundRepository extends JpaRepository<InterviewRound, Long> {
    
    // Find all rounds for a specific candidate
    List<InterviewRound> findByCandidateIdOrderByScheduledAt(Long candidateId);
    
    // Find all rounds for a specific recruiter
    List<InterviewRound> findByRecruiterIdOrderByScheduledAt(Long recruiterId);
    
    // Find all rounds for a specific job
    List<InterviewRound> findByJobIdOrderByScheduledAt(Long jobId);
    
    // Find all rounds for a specific candidate and job
    List<InterviewRound> findByCandidateIdAndJobIdOrderByScheduledAt(Long candidateId, Long jobId);
    
    // Find rounds by status
    List<InterviewRound> findByStatusOrderByScheduledAt(RoundStatus status);
    
    // Find all rounds for a candidate with a specific status
    List<InterviewRound> findByCandidateIdAndStatusOrderByScheduledAt(Long candidateId, RoundStatus status);
    
    // Find all rounds for a recruiter with a specific status
    List<InterviewRound> findByRecruiterIdAndStatusOrderByScheduledAt(Long recruiterId, RoundStatus status);
    
    // Check if candidate has any rejected rounds for a job
    boolean existsByCandidateIdAndJobIdAndStatus(Long candidateId, Long jobId, RoundStatus status);
    
    // Count rounds by status for a candidate and job
    @Query("SELECT COUNT(r) FROM InterviewRound r WHERE r.candidateId = :candidateId AND r.jobId = :jobId AND r.status = :status")
    long countByCandidateIdAndJobIdAndStatus(@Param("candidateId") Long candidateId, @Param("jobId") Long jobId, @Param("status") RoundStatus status);
    
    // Get the latest round for a candidate and job
    @Query("SELECT r FROM InterviewRound r WHERE r.candidateId = :candidateId AND r.jobId = :jobId ORDER BY r.scheduledAt DESC LIMIT 1")
    InterviewRound findLatestRoundByCandidateIdAndJobId(@Param("candidateId") Long candidateId, @Param("jobId") Long jobId);
}