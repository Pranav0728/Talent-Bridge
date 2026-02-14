'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import RecruiterNavbar from '../../RecruiterComponents/RecruiterNavbar'
import InterviewRoundsModal from '../../RecruiterComponents/InterviewRoundsModal'
import { 
  User, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  ChevronLeft,
  Search,
  Filter,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

function page() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id
  
  const [applications, setApplications] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Fetch job details and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        // Fetch job details
        const jobResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setJob(jobResponse.data)
        
        // Fetch applications for this job with enhanced interview round data
        let applicationsResponse;
        try {
          // Try enhanced endpoint first
          applicationsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/job/${jobId}/enhanced`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        } catch (appError) {
          console.warn('Enhanced endpoint failed, falling back to basic applications:', appError.message)
          // Fallback to basic applications if enhanced endpoint fails
          applicationsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/job/${jobId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        }
        setApplications(applicationsResponse.data)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load applications. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    if (jobId) {
      fetchData()
    }
  }, [jobId])

  // Enhanced Application Status Component
  const EnhancedApplicationStatus = ({ application }) => {
    // Handle PROCESS conversion for display
    const displayStatus = application.status === 'PROCESS' ? 'PROCESS' : application.status;
    
    const [enhancedStatus, setEnhancedStatus] = useState({
      status: displayStatus,
      label: displayStatus,
      color: 'blue'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchRounds = async () => {
        try {
          setLoading(true)
          const rounds = await fetchInterviewRounds(application.user?.id, application.jobId)
          const enhanced = getEnhancedStatus(application, rounds?.rounds || [])
          setEnhancedStatus(enhanced)
        } catch (err) {
          console.error('Error fetching interview rounds for status:', err)
          // Fallback to basic status with PROCESS conversion
          const fallbackStatus = application.status === 'PROCESS' ? 'PROCESS' : application.status;
          setEnhancedStatus({
            status: fallbackStatus,
            label: fallbackStatus,
            color: fallbackStatus === 'ACCEPTED' ? 'green' : 
                   fallbackStatus === 'REJECTED' ? 'red' : 'blue'
          })
        } finally {
          setLoading(false)
        }
      }

      fetchRounds()
    }, [application])

    if (loading) {
      return (
        <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 animate-pulse">
          Loading...
        </div>
      )
    }

    const getStatusIcon = () => {
      switch (enhancedStatus.status) {
        case 'WAITING':
          return <Clock className="w-4 h-4 inline mr-1" />
        case 'ONGOING':
          return <RefreshCw className="w-4 h-4 inline mr-1" />
        case 'ACCEPTED':
          return <CheckCircle className="w-4 h-4 inline mr-1" />
        case 'REJECTED':
          return <XCircle className="w-4 h-4 inline mr-1" />
        default:
          return <Clock className="w-4 h-4 inline mr-1" />
      }
    }

    const getStatusColor = () => {
      switch (enhancedStatus.color) {
        case 'yellow':
          return 'bg-yellow-100 text-yellow-800'
        case 'purple':
          return 'bg-purple-100 text-purple-800'
        case 'green':
          return 'bg-green-100 text-green-800'
        case 'red':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-blue-100 text-blue-800'
      }
    }

    return (
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        {enhancedStatus.label}
      </div>
    )
  }

  const handleManageRounds = (application) => {
    console.log('📋 Opening interview rounds modal for application:', application)
    console.log('📋 Application user data:', application.user)
    console.log('📋 Candidate ID (user.id):', application.user?.id)
    console.log('📋 Job ID:', application.jobId)
    setSelectedApplication(application)
    setShowInterviewModal(true)
  }

  const closeInterviewModal = () => {
    setShowInterviewModal(false)
    setSelectedApplication(null)
  }

  // Fetch interview rounds for an application
  const fetchInterviewRounds = async (candidateId, jobId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found')
        return null
      }
      
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/application/candidate/${candidateId}/job/${jobId}`
      console.log('Fetching interview rounds from:', url)
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      console.log('Interview rounds response:', response.data)
      return response.data
    } catch (err) {
      console.error('Error fetching interview rounds:', err.response?.status, err.response?.data, err.message)
      return null
    }
  }

  // Get enhanced status based on interview rounds
  const getEnhancedStatus = (application, rounds) => {
    if (!rounds || rounds.length === 0) {
      return {
        status: application.status,
        label: application.status,
        color: application.status === 'ACCEPTED' ? 'green' : 
               application.status === 'REJECTED' ? 'red' : 'blue'
      }
    }

    const lastRound = rounds[rounds.length - 1]
    const totalRounds = rounds.length
    const completedRounds = rounds.filter(r => r.status === 'ACCEPTED' || r.status === 'REJECTED').length
    const acceptedRounds = rounds.filter(r => r.status === 'ACCEPTED').length
    const rejectedRounds = rounds.filter(r => r.status === 'REJECTED').length

    // If any round is rejected, overall status is rejected
    if (rejectedRounds > 0) {
      return {
        status: 'REJECTED',
        label: `Rejected after ${completedRounds} round${completedRounds > 1 ? 's' : ''}`,
        color: 'red'
      }
    }

    // If all rounds completed and accepted
    if (completedRounds === totalRounds && acceptedRounds === totalRounds) {
      return {
        status: 'ACCEPTED',
        label: `Accepted after ${totalRounds} round${totalRounds > 1 ? 's' : ''}`,
        color: 'green'
      }
    }

    // If there are ongoing rounds
    if (lastRound.status === 'WAITING') {
      return {
        status: 'WAITING',
        label: `Waiting for round ${totalRounds}`,
        color: 'yellow'
      }
    }

    if (lastRound.status === 'ONGOING') {
      return {
        status: 'ONGOING',
        label: `Round ${totalRounds} ongoing`,
        color: 'purple'
      }
    }

    // Default to application status
    return {
      status: application.status,
      label: application.status,
      color: application.status === 'ACCEPTED' ? 'green' : 
             application.status === 'REJECTED' ? 'red' : 'blue'
    }
  }

  // Update application status
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      if (!applicationId) {
        throw new Error('Application ID is required')
      }
      if (!newStatus) {
        throw new Error('Status is required')
      }
      setUpdateLoading(true)
      const token = localStorage.getItem('token')
      
      const url = `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/status/${applicationId}?status=${newStatus}`
      console.log('Sending status update request to:', url)
      console.log('Application ID:', applicationId)
      console.log('New Status:', newStatus)
      
      await axios.put(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Update local state - handle both PROCESS and PROCESS
      const displayStatus = newStatus === 'PROCESS' ? 'PROCESS' : newStatus;
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: displayStatus } : app
      ))
      
      setMessage({ 
        type: 'success', 
        text: `Application ${newStatus === 'ACCEPTED' ? 'accepted' : newStatus === 'REJECTED' ? 'rejected' : 'moved to process'} successfully!` 
      })
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error('Error updating application status:', err)
      const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to update application status. Please try again.'
      setMessage({ 
        type: 'error', 
        text: `Error: ${errorMessage}` 
      })
    } finally {
      setUpdateLoading(false)
    }
  }

  // Filter applications by status and search term
  const filteredApplications = applications.filter(app => {
    // Handle both PROCESS and PROCESS for backward compatibility
    let appStatus = app.status;
    if (appStatus === 'PROCESS' && statusFilter === 'PROCESS') {
      appStatus = 'PROCESS';
    }
    
    const matchesStatus = statusFilter === 'ALL' || appStatus === statusFilter
    const matchesSearch = searchTerm === '' || 
      (app.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       app.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesStatus && matchesSearch
  })

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Applications</h3>
              <p className="mt-1 text-red-700">{error}</p>
              <button 
                onClick={() => router.back()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <RecruiterNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <button 
              onClick={() => router.back()}
              className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Applications for {job?.jobTitle || 'Job'}
            </h1>
          </div>
          <p className="text-gray-600 ml-10">
            Review and manage applications for this position
          </p>
        </div>

        {/* Job Summary Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{job?.jobTitle}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-4 h-4 mr-1 text-blue-500" />
                  <span className="text-sm">{job?.job_type || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1 text-red-500" />
                  <span className="text-sm">{job?.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-sm">Posted on {formatDate(job?.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Total Applications</div>
                  <div className="text-2xl font-bold text-blue-700">{applications.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Applications</option>
              <option value="APPLIED">Applied</option>
              <option value="PROCESS">In Process</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'ALL' 
                ? `There are no ${statusFilter.toLowerCase()} applications for this job.`
                : searchTerm 
                  ? 'No applications match your search criteria.'
                  : 'There are no applications for this job yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((application) => (
              <div 
                key={application.id} 
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {application.user?.firstName?.[0] || 'U'}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.user?.firstName} {application.user?.lastName}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Applied on {formatDate(application.appliedDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center">
                      <EnhancedApplicationStatus application={application} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{application.user?.email || '—'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{application.user?.phone || '—'}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between">
                    <Link 
                      href={`/recruiter/applicants/${application.user?.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-0"
                    >
                      <User className="w-4 h-4 mr-1" />
                      View Full Profile
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleManageRounds(application)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
                      >
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Manage Interview Rounds
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Status:</span>
                        <select
                          value={application.status}
                          onChange={(e) => {
                            if (e.target.value !== application.status) {
                              // Use shorter value for backend compatibility
                              const backendValue = e.target.value === 'PROCESS' ? 'PROCESS' : e.target.value;
                              updateApplicationStatus(application.id, backendValue)
                            }
                          }}
                          disabled={updateLoading}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="PROCESS">In Process</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    
    {showInterviewModal && selectedApplication && (
      <InterviewRoundsModal
        isOpen={showInterviewModal}
        onClose={closeInterviewModal}
        jobId={selectedApplication.jobId}
        candidateId={selectedApplication.user?.id}
        candidateName={`${selectedApplication.user?.firstName} ${selectedApplication.user?.lastName}`}
        jobTitle={selectedApplication.jobTitle}
      />
    )}
    </div>
  )
}

export default page