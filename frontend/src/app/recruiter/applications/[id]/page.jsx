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

  // Enhanced date formatting with relative time
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Enhanced Application Status Component
  const EnhancedApplicationStatus = ({ application }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'APPLIED':
          return {
            bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            icon: '📝',
            label: 'Applied'
          }
        case 'PROCESS':
          return {
            bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-700',
            icon: '⚡',
            label: 'In Process'
          }
        case 'ACCEPTED':
          return {
            bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700',
            icon: '✅',
            label: 'Accepted'
          }
        case 'REJECTED':
          return {
            bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-700',
            icon: '❌',
            label: 'Rejected'
          }
        default:
          return {
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            textColor: 'text-gray-700',
            icon: '📋',
            label: status
          }
      }
    }

    const config = getStatusConfig(application.status)
    
    return (
      <div className={`px-4 py-2 rounded-2xl border-2 ${config.bgColor} ${config.borderColor} ${config.textColor} font-semibold flex items-center space-x-2 shadow-lg`}>
        <span className="text-lg">{config.icon}</span>
        <span>{config.label}</span>
      </div>
    )
  }

  // Add custom animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      .float-animation {
        animation: float 6s ease-in-out infinite;
      }
      .shimmer-bg {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        background-size: 200% 100%;
        animation: shimmer 3s infinite;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <RecruiterNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-padding">
                <div className="absolute inset-1 bg-white rounded-full"></div>
              </div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700">Loading applications...</p>
            <p className="text-sm text-gray-500">Preparing your dashboard</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <RecruiterNavbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <AlertCircle className="relative w-16 h-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              <button 
                onClick={() => router.back()}
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <RecruiterNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeInUp">
        {/* Page Header */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl float-animation"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '4s' }}></div>
        </div>
        {/* Header Section */}
        <div className="relative mb-12">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.back()}
              className="group mr-4 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-indigo-600 transition-colors" />
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Applications
              </h1>
              <p className="text-lg text-gray-600">
                Review and manage applications for <span className="font-semibold text-gray-800">{job?.jobTitle || 'this position'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Job Summary Card with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{job?.jobTitle}</h2>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center text-gray-600 bg-white/50 px-4 py-2 rounded-lg">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                  <span className="text-sm font-medium">{job?.job_type || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600 bg-white/50 px-4 py-2 rounded-lg">
                  <MapPin className="w-5 h-5 mr-2 text-rose-500" />
                  <span className="text-sm font-medium">{job?.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600 bg-white/50 px-4 py-2 rounded-lg">
                  <Calendar className="w-5 h-5 mr-2 text-emerald-500" />
                  <span className="text-sm font-medium">Posted {formatDate(job?.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-8">
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-4 rounded-2xl border border-blue-100">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-900">Total Applications</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{applications.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display with Enhanced Design */}
        {message.text && (
          <div className={`mb-8 p-6 rounded-2xl flex items-center backdrop-blur-sm border ${
            message.type === 'success' 
              ? 'bg-green-50/80 text-green-800 border-green-200 shadow-lg shadow-green-100' 
              : 'bg-red-50/80 text-red-800 border-red-200 shadow-lg shadow-red-100'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-6 h-6 mr-3" />
            ) : (
              <AlertCircle className="w-6 h-6 mr-3" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Filters and Search with Glassmorphism */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
              placeholder="Search applicants by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <Filter className="h-5 w-5 text-gray-500" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-4 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <option value="ALL">📋 All Applications</option>
              <option value="APPLIED">📝 Applied</option>
              <option value="PROCESS">⚡ In Process</option>
              <option value="ACCEPTED">✅ Accepted</option>
              <option value="REJECTED">❌ Rejected</option>
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
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {application.user?.firstName} {application.user?.lastName}
                        </h3>
                        <p className="text-gray-600 text-sm flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Applied {formatDate(application.appliedDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center">
                      <EnhancedApplicationStatus application={application} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-700 bg-white/50 px-4 py-3 rounded-xl">
                      <Mail className="w-5 h-5 text-indigo-500 mr-3" />
                      <span className="font-medium">{application.user?.email || '—'}</span>
                    </div>
                    <div className="flex items-center text-gray-700 bg-white/50 px-4 py-3 rounded-xl">
                      <Phone className="w-5 h-5 text-emerald-500 mr-3" />
                      <span className="font-medium">{application.user?.phone || '—'}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between">
                    <Link 
                      href={`/recruiter/applicants/${application.user?.id}`}
                      className="group inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 sm:mb-0 transition-all duration-200"
                    >
                      <div className="p-2 bg-indigo-50 rounded-lg mr-3 group-hover:bg-indigo-100 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-semibold">View Full Profile</span>
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleManageRounds(application)}
                        className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
                      >
                        <div className="p-1 bg-white/20 rounded-lg mr-3">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Manage Rounds</span>
                      </button>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-700">Status:</span>
                        <select
                          value={application.status}
                          onChange={(e) => {
                            if (e.target.value !== application.status) {
                              const backendValue = e.target.value === 'PROCESS' ? 'PROCESS' : e.target.value;
                              updateApplicationStatus(application.id, backendValue)
                            }
                          }}
                          disabled={updateLoading}
                          className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                        >
                          <option value="APPLIED">📝 Applied</option>
                          <option value="PROCESS">⚡ In Process</option>
                          <option value="ACCEPTED">✅ Accepted</option>
                          <option value="REJECTED">❌ Rejected</option>
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