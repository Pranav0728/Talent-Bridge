# AI Integration - Skill Guidance System

## Overview
This system connects the frontend SkillActionPanel component to a real AI backend using GroqCloud API to provide personalized skill guidance for job seekers.

## Backend Components

### 1. Configuration
- **File**: `backend/src/main/resources/application.properties`
- **Key**: `groq.api.key=${NEXT_PUBLIC_GOOGLE_API_KEY}`
- **Purpose**: Securely stores GroqCloud API key

### 2. DTOs
- **SkillGuidanceRequestDTO**: Handles incoming requests with skill name and current match score
- **SkillGuidanceResponseDTO**: Structures AI response with learning roadmap, interview tips, etc.

### 3. Services
- **GroqCloudService**: Handles direct API calls to GroqCloud with proper error handling and timeouts
- **AiSkillGuidanceService**: Processes AI responses and provides fallback guidance

### 4. Controller
- **AiSkillGuidanceController**: Exposes `/api/ai/skill-guidance` endpoint with CORS support

## Frontend Changes

### SkillActionPanel Component
- **Location**: `frontend/src/app/componets/SkillActionPanel.jsx`
- **Changes**:
  - Removed mock data and setTimeout simulation
  - Added real API calls to `/api/ai/skill-guidance`
  - Implemented proper error handling with fallback messages
  - Added 15-second timeout for API calls
  - Transforms AI response to match component's expected format

## API Request Format
```json
{
  "skill": "JavaScript",
  "currentMatchScore": 65
}
```

## Expected AI Response Format
```json
{
  "skill": "JavaScript",
  "importance": "Why this skill matters for the job",
  "learningRoadmap": [
    "Basics you must know",
    "Intermediate concepts", 
    "Advanced/job-specific usage"
  ],
  "miniTask": "One real-world task or mini project",
  "estimatedTime": "2–3 weeks",
  "priority": "Critical",
  "matchIncrease": 15,
  "interviewTips": [
    "Common interview question 1",
    "Common interview question 2"
  ],
  "resumeTip": "How to mention this skill on resume"
}
```

## Security Features
- API key stored securely in backend only
- No exposure of API key to frontend
- Proper CORS configuration
- Request timeout handling

## Error Handling
- **AI API Failure**: Returns user-friendly fallback guidance
- **Network Issues**: 15-second timeout with graceful degradation
- **Invalid Responses**: Automatic fallback to ensure UX consistency

## Setup Instructions

1. **Add GroqCloud API Key**:
   ```properties
   # In application.properties
groq.api.key=your_actual_groq_api_key_here
   ```

2. **Environment Variable** (Alternative):
   ```bash
   export NEXT_PUBLIC_GOOGLE_API_KEY=your_groq_api_key_here
   ```

3. **Dependencies**: Spring WebFlux automatically included for HTTP client

## Testing
- **Example Response**: See `backend/src/main/resources/example-ai-response.json`
- **Fallback Mode**: Test by temporarily breaking the API connection
- **Timeout Handling**: Verify 15-second timeout works correctly

## Features
✅ Real AI-powered skill guidance
✅ Structured learning roadmaps
✅ Interview preparation tips
✅ Resume writing advice
✅ Match score improvement predictions
✅ Priority-based skill recommendations
✅ Error resilience with fallback content
✅ Clean, modular architecture