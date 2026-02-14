'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import JobSeekerNavbar from '../JobSeekerNavbar'
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  User,
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react'

const STATUS_COLORS = {
  WAITING: 'bg-gray-100 text-gray-800 border-gray-200',
  ONGOING: 'bg-blue-100 text-blue-800 border-blue-200',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200'
}

const STATUS_ICONS = {
  WAITING: Clock,
  ONGOING: Clock,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle
}

const OVERALL_STATUS_COLORS = {
  'In Progress': 'bg-blue-100 text-blue-800',
  'Selected': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800'
}

export default function ApplicationStatusPage({ applicationId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [application, setApplication] = useState(null)
  const [rounds, setRounds] = useState([])
  const [overallStatus, setOverallStatus] = useState('In Progress')

  useEffect(() => {
    if (applicationId) {
      fetchApplicationData()
    }
  }, [applicationId])

  const fetchApplicationData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      if (!token || !userId) {
        router.push('/unauthorized')
        return
      }

      // Fetch application details
      const applicationResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      setApplication(applicationResponse.data)

      // Fetch interview rounds
      const roundsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/interview-rounds/candidate/${userId}/job/${applicationResponse.data.jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      setRounds(roundsResponse.data.rounds || [])
      
      // Calculate overall status
      calculateOverallStatus(roundsResponse.data.rounds || [], applicationResponse.data.status)
      
    } catch (err) {
      console.error('Error fetching application data:', err)
      setError('Failed to load application details')
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallStatus = (rounds, applicationStatus) => {
    if (applicationStatus === 'REJECTED') {
      setOverallStatus('Rejected')
      return
    }
    
    if (applicationStatus === 'ACCEPTED') {
      setOverallStatus('Selected')
      return
    }
    
    if (rounds.length === 0) {
      setOverallStatus('In Progress')
      return
    }
    
    const hasRejectedRound = rounds.some(round => round.status === 'REJECTED')
    const hasAcceptedRound = rounds.some(round => round.status === 'ACCEPTED')
    const allRoundsCompleted = rounds.length > 0 && rounds.every(round => 
      round.status === 'ACCEPTED' || round.status === 'REJECTED'
    )
    
    if (hasRejectedRound) {
      setOverallStatus('Rejected')
    } else if (hasAcceptedRound && allRoundsCompleted) {
      setOverallStatus('Selected')
    } else {
      setOverallStatus('In Progress')
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const refreshData = () => {
    fetchApplicationData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobSeekerNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobSeekerNavbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobSeekerNavbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Application Not Found</h2>
            <p className="text-yellow-600 mb-4">The application you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/jobseeker/applications')}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JobSeekerNavbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/jobseeker/applications')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </button>
            
            <button
              onClick={refreshData}
              className="inline-flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${OVERALL_STATUS_COLORS[overallStatus]}`}>
                {overallStatus}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Job Details
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Position</label>
                    <p className="text-lg font-semibold text-gray-900">{application.jobTitle}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{application.companyName || 'Company Name'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{application.jobLocation || 'Location not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Applied On</label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{formatDate(application.appliedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recruiter Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Recruiter Details
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{application.recruiterName || 'Recruiter Name'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{application.recruiterEmail || 'Email not available'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{application.recruiterPhone || 'Phone not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Rounds Timeline */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-purple-600" />
              Interview Rounds
            </h2>
            <div className="text-sm text-gray-600">
              {rounds.length} round{rounds.length !== 1 ? 's' : ''} completed
            </div>
          </div>

          {rounds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview Rounds Scheduled</h3>
              <p className="text-gray-600 mb-4">Interview rounds will appear here once the recruiter schedules them.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>What's next?</strong> The recruiter will contact you to schedule interview rounds. 
                  Check back here regularly for updates on your application progress.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-8">
                {rounds.map((round, index) => {
                  const StatusIcon = STATUS_ICONS[round.status]
                  return (
                    <div key={round.id} className="relative flex items-start space-x-6">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 relative z-10">
                        <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            round.status === 'ACCEPTED' ? 'bg-green-500' :
                            round.status === 'REJECTED' ? 'bg-red-500' :
                            round.status === 'ONGOING' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}>
                            <StatusIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Round card */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{round.roundName}</h3>
                              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                                {round.roundType}
                              </span>
                            </div>
                            
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[round.status]}`}>
                              <StatusIcon className="w-4 h-4 mr-2" />
                              {round.status}
                            </span>
                          </div>
                          
                          <div className="text-right text-sm text-gray-500">
                            Round {index + 1}
                          </div>
                        </div>

                        {round.description && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                            <p className="text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                              {round.description}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              Scheduled Date & Time
                            </h4>
                            <p className="text-gray-900 font-medium">{formatDateTime(round.scheduledAt)}</p>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              {round.mode === 'ONLINE' ? (
                                <Video className="w-4 h-4 mr-2 text-gray-400" />
                              ) : (
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              )}
                              Interview Mode
                            </h4>
                            <p className="text-gray-900 font-medium capitalize">{round.mode.toLowerCase()}</p>
                            {round.locationOrLink && (
                              <p className="text-sm text-blue-600 mt-1">{round.locationOrLink}</p>
                            )}
                          </div>
                        </div>

                        {round.status === 'ONGOING' && (
                          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 text-blue-600 mr-3" />
                              <div>
                                <h4 className="text-sm font-medium text-blue-900">Current Round in Progress</h4>
                                <p className="text-sm text-blue-700">This interview round is currently ongoing. Good luck!</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {round.status === 'ACCEPTED' && (
                          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                              <div>
                                <h4 className="text-sm font-medium text-green-900">Round Passed</h4>
                                <p className="text-sm text-green-700">Congratulations! You've successfully completed this round.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {round.status === 'REJECTED' && (
                          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <XCircle className="w-5 h-5 text-red-600 mr-3" />
                              <div>
                                <h4 className="text-sm font-medium text-red-900">Round Not Successful</h4>
                                <p className="text-sm text-red-700">Unfortunately, you didn't pass this round. Keep trying!</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Progress Summary */}
          {rounds.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{rounds.length}</div>
                  <div className="text-sm text-gray-600">Total Rounds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {rounds.filter(r => r.status === 'ACCEPTED').length}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {rounds.filter(r => r.status === 'REJECTED').length}
                  </div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((rounds.filter(r => r.status === 'ACCEPTED').length / rounds.length) * 100) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}