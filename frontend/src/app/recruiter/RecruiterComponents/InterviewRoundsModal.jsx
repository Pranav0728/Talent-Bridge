'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  X,
  Plus,
  AlertTriangle
} from 'lucide-react'

import RoundsTimeline from '@/app/componets/InterviewRounds/RoundsTimeline'
import RoundForm from '@/app/componets/InterviewRounds/RoundForm'

export default function InterviewRoundsModal({
  isOpen,
  onClose,
  jobId,
  candidateId,
  candidateName,
  jobTitle
}) {
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRound, setEditingRound] = useState(null)
  const [isRejected, setIsRejected] = useState(false)
  const [recruiterId, setRecruiterId] = useState(null)

  // Add custom animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }
      .animate-scaleIn {
        animation: scaleIn 0.3s ease-out forwards;
      }
      .float-animation {
        animation: float 6s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    if (isOpen && jobId && candidateId) {
      fetchRounds()
    }
  }, [isOpen, jobId, candidateId])

  const fetchRounds = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      // First, get the recruiter ID from user ID if not already fetched
      if (!recruiterId && userId) {
        try {
          const recruiterResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/user/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (recruiterResponse.data) {
            setRecruiterId(recruiterResponse.data.recruiterId)
          }
        } catch (recruiterErr) {
          console.error('Error fetching recruiter info:', recruiterErr)
          setError('Failed to load recruiter profile')
          return
        }
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/application/candidate/${candidateId}/job/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const roundsData = response.data.rounds || []
      setRounds(roundsData)
      const hasRejected = roundsData.some((round) => round.status === 'REJECTED')
      setIsRejected(hasRejected)
    } catch (err) {
      console.error('Error fetching interview rounds:', err)
      setError('Failed to load interview rounds')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRound = async (formData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Validate required fields
      console.log('🔍 Validating fields - recruiterId:', recruiterId, 'jobId:', jobId, 'candidateId:', candidateId)
      
      if (!recruiterId) {
        throw new Error('Recruiter ID not available')
      }
      if (!jobId) {
        throw new Error('Job ID is required')
      }
      if (!candidateId) {
        throw new Error(`Candidate ID is required. Received: ${candidateId} (type: ${typeof candidateId})`)
      }
      
      // Ensure IDs are valid numbers
      const jobIdNum = parseInt(jobId)
      const candidateIdNum = parseInt(candidateId)
      
      if (isNaN(jobIdNum) || jobIdNum <= 0) {
        throw new Error(`Invalid Job ID: ${jobId}`)
      }
      if (isNaN(candidateIdNum) || candidateIdNum <= 0) {
        throw new Error(`Invalid Candidate ID: ${candidateId}`)
      }

      // Prepare the payload
      const payload = {
        roundName: formData.roundName,
        roundType: formData.roundType,
        description: formData.description,
        scheduledAt: formData.scheduledAt,
        mode: formData.mode,
        locationOrLink: formData.locationOrLink,
        jobId: jobIdNum,
        candidateId: candidateIdNum
      }

      console.log('🚀 Creating interview round with payload:', JSON.stringify(payload, null, 2))
      console.log('🚀 Using recruiter ID:', recruiterId)
      console.log('🚀 API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/recruiter/${recruiterId}`)
      
      // Validate payload before sending
      const requiredFields = ['roundName', 'roundType', 'scheduledAt', 'mode', 'jobId', 'candidateId']
      const missingFields = requiredFields.filter(field => !payload[field])
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields)
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }
      
      // Verify job ownership before creating the round
      try {
        const jobResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const job = jobResponse.data
        console.log('🔍 Job details:', job)
        console.log('🔍 Job recruiter ID:', job.recruiter?.recruiterId)
        console.log('🔍 Current recruiter ID:', recruiterId)
        
        if (!job.recruiter || job.recruiter.recruiterId !== recruiterId) {
          throw new Error(`Job ${jobId} does not belong to recruiter ${recruiterId}. Job belongs to recruiter ${job.recruiter?.recruiterId}`)
        }
        
        console.log('✅ Job ownership verified')
      } catch (jobErr) {
        console.error('❌ Job ownership verification failed:', jobErr)
        if (jobErr.response?.status === 404) {
          throw new Error(`Job ${jobId} not found`)
        }
        throw jobErr
      }
      
      // Test if the job exists and belongs to this recruiter
      try {
        const jobResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        console.log('Job details:', jobResponse.data)
        console.log('Job recruiter ID:', jobResponse.data.recruiter?.recruiterId)
      } catch (jobErr) {
        console.error('Error fetching job details:', jobErr)
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/recruiter/${recruiterId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setShowAddForm(false)
      fetchRounds()
      
      // Show success toast
      alert('✅ Interview round created successfully!')
    } catch (err) {
      console.error('❌ Error creating interview round:', err)
      console.error('❌ Error response data:', err.response?.data)
      console.error('❌ Error response status:', err.response?.status)
      console.error('❌ Error response headers:', err.response?.headers)
      
      // Try to get specific error details
      const errorData = err.response?.data
      let errorMessage = 'Failed to create interview round'
      
      if (errorData) {
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else {
          errorMessage = JSON.stringify(errorData)
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      console.error('❌ Final error message:', errorMessage)
      alert(`❌ Failed to create interview round: ${errorMessage}`)
      throw new Error(`Failed to create interview round: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRound = async (formData) => {
    if (!editingRound) return

    try {
      setLoading(true)

      const token = localStorage.getItem('token')

      if (!recruiterId) {
        throw new Error('Recruiter ID not available')
      }

      // Prepare the update payload
      const payload = {
        roundName: formData.roundName,
        roundType: formData.roundType,
        description: formData.description,
        scheduledAt: formData.scheduledAt,
        mode: formData.mode,
        locationOrLink: formData.locationOrLink,
        jobId: parseInt(jobId),
        candidateId: parseInt(candidateId)
      }

      console.log('Updating interview round with payload:', payload);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/${editingRound.id}/recruiter/${recruiterId}`);
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/${editingRound.id}/recruiter/${recruiterId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setEditingRound(null)
      fetchRounds()
      alert('✅ Interview round updated successfully!')
    } catch (err) {
      console.error('Error updating round:', err)
      console.error('Error response:', err.response)
      console.error('Error status:', err.response?.status)
      console.error('Error data:', err.response?.data)
      
      let errorMessage = '❌ Failed to update interview round. '
      if (err.response?.status === 400) {
        errorMessage += 'Invalid data provided. Please check all fields.'
      } else if (err.response?.status === 404) {
        errorMessage += 'Interview round not found.'
      } else if (err.response?.status === 403) {
        errorMessage += 'You don\'t have permission to update this round.'
      } else {
        errorMessage += 'Please try again.'
      }
      
      alert(errorMessage)
      throw new Error(`Failed to update interview round: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (roundId, newStatus) => {
    if (newStatus === 'REJECTED') {
      const confirmed = confirm(
        'Are you sure you want to reject this candidate? This will end the interview process.'
      )
      if (!confirmed) return
    }

    try {
      setLoading(true)

      const token = localStorage.getItem('token')

      if (!recruiterId) {
        throw new Error('Recruiter ID not available')
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/${roundId}/recruiter/${recruiterId}/status`,
        null,
        {
          params: { status: newStatus },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchRounds()
      
      // Show success toast
      const statusMessage = newStatus === 'ACCEPTED' ? '✅ Round completed successfully!' : 
                          newStatus === 'REJECTED' ? '❌ Candidate rejected' : '✅ Status updated!'
      alert(statusMessage)
    } catch (err) {
      console.error('Error updating round status:', err)
      const errorMessage = err.response?.data?.message || 'Failed to update round status'
      setError(errorMessage)
      alert(`❌ Failed to update round status: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRound = async (roundId) => {
    const confirmed = confirm(
      'Are you sure you want to delete this interview round?'
    )
    if (!confirmed) return

    try {
      setLoading(true)

      const token = localStorage.getItem('token')

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/${roundId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchRounds()
    } catch (err) {
      console.error('Error deleting interview round:', err)
      setError('Failed to delete interview round')
    } finally {
      setLoading(false)
    }
  }

  const handleEditRound = (round) => {
    setEditingRound(round)
    setShowAddForm(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl float-animation"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-2xl float-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl float-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/20 transform transition-all duration-300 scale-95 animate-scaleIn">
        {/* Enhanced Header with Glassmorphism */}
        <div className="flex items-center justify-between p-8 border-b border-white/20 bg-gradient-to-r from-indigo-100/50 via-purple-100/50 to-blue-100/50 backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Manage Interview Rounds
            </h2>
            

            {isRejected && (
              <div className="mt-3 flex items-center text-red-600 bg-red-50/80 px-4 py-2 rounded-2xl border border-red-200">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="text-sm font-semibold">
                  Candidate has been rejected
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="group p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <X className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)]">
          {/* Left Panel - Timeline */}
          <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-white/50 to-blue-50/30 backdrop-blur-sm">
            {loading && (
              <div className="flex items-center justify-center h-32">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-padding">
                    <div className="absolute inset-1 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {!loading && (
              <RoundsTimeline
                rounds={rounds}
                isReadOnly={false}
                onStatusChange={handleStatusChange}
                onEdit={handleEditRound}
                onDelete={handleDeleteRound}
              />
            )}
          </div>

          {/* Right Panel - Form */}
          {showAddForm ? (
            <div className="w-full lg:w-96 bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm flex flex-col h-full border-l border-white/20">
              <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/60 backdrop-blur-sm">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {editingRound
                    ? 'Edit Interview Round'
                    : 'Add Interview Round'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingRound(null)
                  }}
                  className="group p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/90 transition-all duration-200"
                >
                  <X className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-white/50 to-indigo-50/30">
                <RoundForm
                  round={editingRound}
                  onSubmit={
                    editingRound
                      ? handleUpdateRound
                      : handleCreateRound
                  }
                  onCancel={() => {
                    setShowAddForm(false)
                    setEditingRound(null)
                  }}
                  jobId={jobId}
                  candidateId={candidateId}
                />
              </div>
            </div>
          ) : (
            <div className="w-full lg:w-96 bg-gradient-to-br from-white/80 to-blue-50/40 backdrop-blur-sm p-8 flex flex-col items-center justify-center border-l border-white/20">
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl p-6 shadow-lg">
                  <div className="bg-white/80 rounded-2xl p-4 shadow-inner">
                    <Plus className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Ready to Add</h4>
                    <p className="text-sm text-gray-600">Create a new interview round</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  disabled={isRejected}
                  className={`group inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    isRejected
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed transform-none shadow-none'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700'
                  }`}
                >
                  <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Add Interview Round
                </button>

                {isRejected && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4">
                    <p className="text-sm text-red-700 font-medium text-center">
                      Cannot add rounds for rejected candidates
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
