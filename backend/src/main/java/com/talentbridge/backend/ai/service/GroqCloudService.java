package com.talentbridge.backend.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.*;

@Service
public class GroqCloudService {

    @Value("${groq.api.key}")
    private String apiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.1-8b-instant";
    private static final int MAX_TOKENS = 1000;
    private static final int TIMEOUT = 10000; // 10 seconds

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateSkillGuidance(String skill, int currentMatchScore) {
        System.out.println("GroqCloudService: Generating skill guidance for: " + skill + " with score: " + currentMatchScore);
        try {
            String prompt = buildSkillGuidancePrompt(skill, currentMatchScore);
            System.out.println("GroqCloudService: Built prompt: " + prompt.substring(0, 100) + "...");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL);
            requestBody.put("max_tokens", MAX_TOKENS);
            requestBody.put("temperature", 0.3);
            requestBody.put("response_format", Map.of("type", "json_object"));
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "user", "content", prompt));
            requestBody.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                GROQ_API_URL,
                HttpMethod.POST,
                request,
                String.class
            );

            System.out.println("GroqCloudService: API response status: " + response.getStatusCode());
            System.out.println("GroqCloudService: API response body: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String content = extractContentFromResponse(response.getBody());
                System.out.println("GroqCloudService: Extracted content: " + content);
                return content;
            } else {
                throw new RuntimeException("Failed to get response from GroqCloud API");
            }

        } catch (HttpClientErrorException e) {
            throw new RuntimeException("GroqCloud API error: " + e.getStatusCode() + " - " + e.getMessage());
        } catch (ResourceAccessException e) {
            throw new RuntimeException("Timeout while calling GroqCloud API");
        } catch (Exception e) {
            throw new RuntimeException("Error calling GroqCloud API: " + e.getMessage());
        }
    }

    private String buildSkillGuidancePrompt(String skill, int currentMatchScore) {
        return String.format(
            "You are a career guidance AI helping a job candidate. " +
            "Explain the missing skill '%s' in simple student-friendly language. " +
            "The candidate currently has a %d%% match score for this job. " +
            "Respond ONLY in valid JSON with: " +
            "- importance (why this skill matters for the job) " +
            "- learningRoadmap (array of 3 learning steps) " +
            "- miniTask (one real-world task or mini project) " +
            "- estimatedTime (learning time like '2-3 weeks') " +
            "- priority (Critical, High, Medium, or Low) " +
            "- matchIncrease (estimated percentage increase in match score, 5-25) " +
            "- interviewTips (array of 2 common interview questions) " +
            "- resumeTip (how to mention this skill on resume as a beginner) " +
            "Do not include markdown or extra text. Keep responses short and actionable.",
            skill, currentMatchScore
        );
    }

    private String extractContentFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).get("message");
                if (message != null) {
                    JsonNode content = message.get("content");
                    if (content != null) {
                        return content.asText();
                    }
                }
            }
            throw new RuntimeException("Invalid response format from GroqCloud API");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse GroqCloud API response: " + e.getMessage());
        }
    }
}