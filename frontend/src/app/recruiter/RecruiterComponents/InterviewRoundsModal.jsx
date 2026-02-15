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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Manage Interview Rounds
            </h2>
            {/* <p className="text-sm text-gray-600 mt-1">
              {jobTitle} • {candidateName}
            </p> */}

            {isRejected && (
              <div className="mt-2 flex items-center text-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">
                  Candidate has been rejected
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Left Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
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

          {/* Right Panel */}
          {showAddForm ? (
            <div className="w-full lg:w-96 border-l bg-gray-50 flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b bg-white">
                <h3 className="text-lg font-semibold">
                  {editingRound
                    ? 'Edit Interview Round'
                    : 'Add Interview Round'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingRound(null)
                  }}
                  className="p-1 hover:bg-gray-200 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
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
            <div className="w-full lg:w-96 border-l bg-gray-50 p-6 flex flex-col items-center justify-center">
              <button
                onClick={() => setShowAddForm(true)}
                disabled={isRejected}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium ${
                  isRejected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Interview Round
              </button>

              {isRejected && (
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Cannot add rounds for rejected candidates
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
