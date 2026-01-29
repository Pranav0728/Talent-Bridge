package com.talentbridge.backend.ai.service;

import com.talentbridge.backend.ai.dto.SkillMatchRequestDTO;
import com.talentbridge.backend.ai.dto.SkillMatchResponseDTO;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillMatchService {

    public SkillMatchResponseDTO calculateMatch(SkillMatchRequestDTO request) {
        // 1. Normalize inputs (lowercase, trim, distinct)
        List<String> candidateSkills = normalizeSkills(request.getCandidateSkills());
        List<String> jobSkills = normalizeSkills(request.getJobSkills());

        if (jobSkills.isEmpty()) {
             return new SkillMatchResponseDTO(100, candidateSkills, new ArrayList<>(), "No specific skills required for this job.");
        }

        // 2. Identify Matched and Missing Skills
        // Matched: Intersection of candidate and job skills
        List<String> matchedSkills = candidateSkills.stream()
                .filter(jobSkills::contains)
                .collect(Collectors.toList());

        // Missing: Job skills NOT in candidate skills
        List<String> missingSkills = jobSkills.stream()
                .filter(skill -> !candidateSkills.contains(skill))
                .collect(Collectors.toList());

        // 3. Calculate Cosine Similarity
        double matchPercentage = calculateCosineSimilarity(candidateSkills, jobSkills);

        // 4. Generate Suggestion
        String suggestion = generateSuggestion((int) matchPercentage, missingSkills);

        return new SkillMatchResponseDTO((int) matchPercentage, matchedSkills, missingSkills, suggestion);
    }

    /**
     * Helper to normalize skill strings
     */
    private List<String> normalizeSkills(List<String> skills) {
        if (skills == null) return new ArrayList<>();
        return skills.stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toLowerCase())
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Implements Cosine Similarity Algorithm
     * Formula: (A . B) / (||A|| * ||B||)
     */
    private double calculateCosineSimilarity(List<String> candidateSkills, List<String> jobSkills) {
        // Create a vocabulary (union of all skills) to define the vector space
        Set<String> vocabulary = new HashSet<>();
        vocabulary.addAll(candidateSkills);
        vocabulary.addAll(jobSkills);

        if (vocabulary.isEmpty()) return 0.0;

        List<String> uniqueSkills = new ArrayList<>(vocabulary);

        // Create vectors
        double[] candidateVector = new double[uniqueSkills.size()];
        double[] jobVector = new double[uniqueSkills.size()];

        for (int i = 0; i < uniqueSkills.size(); i++) {
            String skill = uniqueSkills.get(i);
            candidateVector[i] = candidateSkills.contains(skill) ? 1.0 : 0.0;
            jobVector[i] = jobSkills.contains(skill) ? 1.0 : 0.0;
        }

        // Calculate Dot Product and Magnitudes
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < uniqueSkills.size(); i++) {
            dotProduct += candidateVector[i] * jobVector[i];
            normA += Math.pow(candidateVector[i], 2);
            normB += Math.pow(jobVector[i], 2);
        }

        if (normA == 0 || normB == 0) return 0.0;

        double cosineSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        
        // Return percentage (0-100)
        return cosineSimilarity * 100;
    }

    private String generateSuggestion(int percentage, List<String> missingSkills) {
        if (percentage == 100) {
            return "Perfect match! You have all the required skills.";
        } else if (percentage >= 80) {
            return "Excellent match! You are a strong candidate.";
        } else if (percentage >= 50) {
            if (missingSkills.isEmpty()) return "Good match!";
            String topMissing = missingSkills.size() > 2 
                ? missingSkills.subList(0, 2).toString() + " and others"
                : missingSkills.toString();
            return "Good match. Learning " + topMissing + " would improve your chances.";
        } else {
             if (missingSkills.isEmpty()) return "Low match.";
             return "Low match. Focus on learning key skills like: " + missingSkills.get(0);
        }
    }
}