"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Target, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import axios from 'axios';

export default function SkillActionPanel({ skillName, isOpen, onClose, currentMatchScore }) {
  const [loading, setLoading] = useState(false);
  const [skillData, setSkillData] = useState(null);

  useEffect(() => {
    if (isOpen && skillName) {
      fetchSkillGuidance();
    }
  }, [isOpen, skillName]);

  const fetchSkillGuidance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/skill-guidance`, 
        { 
          skill: skillName, 
          currentMatchScore: currentMatchScore 
        }, 
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout
        }
      );
      
      // Transform the API response to match our component's expected format
      const apiData = response.data;
      const transformedData = {
        importance: apiData.importance,
        whatToLearn: apiData.learningRoadmap.map((item, index) => ({
          title: index === 0 ? "Basics" : index === 1 ? "Advanced Concepts" : "Ecosystem",
          content: item
        })),
        miniTask: apiData.miniTask,
        timeToLearn: apiData.estimatedTime,
        priority: apiData.priority,
        matchIncrease: apiData.matchIncrease
      };
      
      setSkillData(transformedData);
    } catch (err) {
      console.error("Error fetching skill guidance:", err);
      
      // Show user-friendly error message
      const errorData = {
        importance: "We're having trouble connecting to our AI service. This skill is important for career growth and will help you qualify for more opportunities.",
        whatToLearn: [
          { title: "Basics", content: "Start with fundamental concepts and core principles." },
          { title: "Advanced Concepts", content: "Explore advanced features and best practices." },
          { title: "Ecosystem", content: "Learn about tools, libraries, and community resources." }
        ],
        miniTask: `Practice ${skillName} by building a simple project that demonstrates your understanding.`,
        timeToLearn: "2-4 weeks",
        priority: "High",
        matchIncrease: 10
      };
      
      setSkillData(errorData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/20 backdrop-blur-sm transition-opacity">
      <div className="h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 transform translate-x-0 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{skillName}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-gray-500 text-sm">Generating personalized guidance...</p>
            </div>
          ) : skillData && (
            <>
              {/* Priority & Time Info */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  skillData.priority === 'Critical' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {skillData.priority} Priority
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {skillData.timeToLearn}
                </div>
              </div>

              {/* Match Boost Summary */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <p className="text-sm text-indigo-900">
                    Learning this skill will increase your job match from 
                    <span className="font-bold mx-1">{currentMatchScore}%</span> 
                    to around 
                    <span className="font-bold mx-1">{currentMatchScore + skillData.matchIncrease}%</span>.
                  </p>
                </div>
              </div>

              {/* Importance Section */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 mr-2 text-indigo-500" />
                  Why it matters
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {skillData.importance}
                </p>
              </section>

              {/* What to Learn - Priority List */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center uppercase tracking-wider">
                  <Target className="w-4 h-4 mr-2 text-indigo-500" />
                  Learning Roadmap
                </h3>
                <div className="space-y-4">
                  {skillData.whatToLearn.map((item, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mini Task */}
              <section className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center uppercase tracking-wider">
                  🚀 Practical Task
                </h3>
                <p className="text-gray-700 text-sm italic">
                  "{skillData.miniTask}"
                </p>
              </section>

              {/* Footer CTA */}
              <div className="pt-4">
                <button 
                  onClick={onClose}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Return to Application
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}