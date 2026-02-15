'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

import JobSeekerNavbar from '../../JobComponents/JobSeekerNavbar'
import RoundsTimeline from '@/app/componets/InterviewRounds/RoundsTimeline'

import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  UserCircle
} from 'lucide-react'

const getStatusColor = (status) => {
  switch (status) {
    case 'APPLIED':
      return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200 shadow-blue-100'
    case 'ACCEPTED':
      return 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-800 border-green-200 shadow-green-100'
    case 'REJECTED':
      return 'bg-gradient-to-r from-red-100 to-rose-50 text-red-800 border-red-200 shadow-red-100'
    default:
      return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200 shadow-gray-100'
  }
}

const getFinalStatusConfig = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return {
        icon: CheckCircle,
        color: 'text-emerald-600',
        bgColor: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
        borderColor: 'border-emerald-200',
        title: '🎉 Congratulations!',
        message: 'You have been selected for this position.',
        glow: 'shadow-emerald-200'
      }
    case 'REJECTED':
      return {
        icon: XCircle,
        color: 'text-rose-600',
        bgColor: 'bg-gradient-to-br from-rose-50 via-red-50 to-pink-50',
        borderColor: 'border-rose-200',
        title: 'Application Status',
        message: 'We regret to inform you that your application was not selected.',
        glow: 'shadow-rose-200'
      }
    default:
      return {
        icon: AlertCircle,
        color: 'text-blue-600',
        bgColor: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50',
        borderColor: 'border-blue-200',
        title: 'Application In Progress',
        message: 'Your application is being reviewed.',
        glow: 'shadow-blue-200'
      }
  }
}

export default function ApplicationTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.applicationId

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [application, setApplication] = useState(null)
  const [interviewRounds, setInterviewRounds] = useState([])
  const [overallStatus, setOverallStatus] = useState('APPLIED')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Add custom CSS for animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .float-animation {
        animation: float 6s ease-in-out infinite;
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
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

  useEffect(() => {
    if (applicationId) {
      fetchApplicationData()
    }
  }, [applicationId])

  useEffect(() => {
    if (autoRefresh && applicationId) {
      const interval = setInterval(() => {
        fetchApplicationData()
        // Show subtle notification that data refreshed
        console.log('📊 Application data refreshed')
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, applicationId])

  // Auto refresh toggle component
  const AutoRefreshToggle = () => (
    <div className="fixed top-24 right-6 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">Auto Refresh</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              autoRefresh ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )

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

      const applicationResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const applicationData = applicationResponse.data
      setApplication(applicationData)
      setOverallStatus(applicationData.status)

      const roundsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-rounds/application/candidate/${userId}/job/${applicationData.jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setInterviewRounds(roundsResponse.data.rounds || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load application details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    const dateObj = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now - dateObj)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today at ' + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday at ' + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getCurrentRound = () =>
    interviewRounds.find(
      (r) => r.status === 'WAITING' || r.status === 'ONGOING'
    )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <JobSeekerNavbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-lg w-1/4 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="h-6 bg-gradient-to-r from-blue-200 to-indigo-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full mb-2" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3" />
              </div>
              <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="h-6 bg-gradient-to-r from-blue-200 to-indigo-200 rounded w-1/2 mb-6" />
                <div className="space-y-4">
                  <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl" />
                  <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl" />
                  <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <JobSeekerNavbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <XCircle className="relative w-16 h-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!application) return null

  const currentRound = getCurrentRound()
  const finalStatusConfig = getFinalStatusConfig(overallStatus)
  const StatusIcon = finalStatusConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <JobSeekerNavbar />
      <AutoRefreshToggle />

      <div className={`max-w-7xl mx-auto px-4 py-8 transition-all duration-1000 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Application Journey
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your progress and stay updated on your application status
          </p>
        </div>
        {/* Header with glass effect */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/jobseeker/dashboard')}
            className="group flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-all duration-200"
          >
            <div className="p-2 bg-white/60 backdrop-blur-sm rounded-full mr-3 group-hover:bg-white/80 transition-all duration-200">
              <ArrowUpRight className="w-4 h-4 rotate-180" />
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Final Status Card with Glassmorphism */}
          <div
            className={`relative overflow-hidden rounded-2xl p-8 border backdrop-blur-sm ${finalStatusConfig.bgColor} ${finalStatusConfig.borderColor} shadow-lg ${finalStatusConfig.glow || 'shadow-blue-200'} float-animation`}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
            
            <div className="relative flex items-center">
              <div className="relative mr-6">
                <div className={`absolute inset-0 ${finalStatusConfig.color} blur-xl opacity-30 animate-pulse`} />
                <StatusIcon className={`relative w-12 h-12 ${finalStatusConfig.color}`} />
              </div>
              <div className="flex-1">
                <h2 className={`text-3xl font-bold ${finalStatusConfig.color} mb-2`}>
                  {finalStatusConfig.title}
                </h2>
                <p className="text-lg opacity-90 font-medium">
                  {finalStatusConfig.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Job Details Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xl font-bold text-gray-900 mb-1">{application.jobTitle}</p>
                  <p className="text-lg text-gray-600 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    {application.companyName}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 flex items-center mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Applied on {formatDate(application.appliedAt)}
                  </p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Round Card */}
            {currentRound && (
              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl border border-amber-200/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Current Round</h3>
                </div>
                
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-gray-900">{currentRound.roundName}</p>
                  <p className="text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Scheduled: {formatDate(currentRound.scheduledAt)}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{currentRound.mode === 'ONLINE' ? 'Online Interview' : 'In-Person Interview'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl">
              <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Interview Journey</h2>
              </div>
              
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200" />
                <RoundsTimeline rounds={interviewRounds} isReadOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
