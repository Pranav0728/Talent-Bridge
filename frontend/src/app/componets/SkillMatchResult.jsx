"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import SkillActionPanel from './SkillActionPanel';

export default function SkillMatchResult({ candidateSkills, jobSkills, matchScore }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (candidateSkills?.length > 0 && jobSkills?.length > 0) {
      calculateMatch();
    }
  }, [candidateSkills, jobSkills]);

  const calculateMatch = async () => {
    setLoading(true);
    setError('');
    try {
      // Get token for authentication (assuming your app uses localStorage for tokens)
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/skill-match`,
        {
          candidateSkills: candidateSkills,
          jobSkills: jobSkills
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setResult(response.data);
    } catch (err) {
      console.error("Skill match error:", err);
      setError("Unable to analyze skill match.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-blue-600 p-4">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Analyzing skill match...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm flex items-center p-4">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    );
  }

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedSkill(null);
  };

  if (!result) return null;
  const displayPercentage = matchScore !== undefined ? matchScore : result.matchPercentage;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      {/* Header with Percentage */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Skill Match Analysis</h3>
        <div className={`px-4 py-1 rounded-full text-sm font-bold ${
          displayPercentage >= 70 ? 'bg-green-100 text-green-800' :
          displayPercentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {displayPercentage}% Match
        </div>
      </div>

      {/* AI Suggestion */}
      <p className="text-gray-600 mb-6 text-sm italic border-l-4 border-blue-500 pl-3">
        "{result.suggestion}"
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Skills Column */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Matched Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.matchedSkills.length > 0 ? (
              result.matchedSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">No matched skills</span>
            )}
          </div>
        </div>

        {/* Missing Skills Column */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <XCircle className="w-4 h-4 mr-2 text-red-600" />
            Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.missingSkills.length > 0 ? (
              result.missingSkills.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => handleSkillClick(skill)}
                  className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 cursor-pointer hover:shadow-sm"
                >
                  {skill}
                </button>
              ))
            ) : (
              <span className="text-sm text-gray-400">No missing skills</span>
            )}
          </div>
        </div>
      </div>

      {/* Skill Action Panel */}
      <SkillActionPanel
        skillName={selectedSkill}
        isOpen={isPanelOpen}
        onClose={closePanel}
        currentMatchScore={displayPercentage}
      />
    </div>
  );
}