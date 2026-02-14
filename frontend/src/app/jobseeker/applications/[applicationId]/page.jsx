'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

import JobSeekerNavbar from '../JobComponents/JobSeekerNavbar'
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
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getFinalStatusConfig = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: '🎉 Congratulations!',
        message: 'You have been selected for this position.'
      }
    case 'REJECTED':
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Application Status',
        message:
          'We regret to inform you that your application was not selected.'
      }
    default:
      return {
        icon: AlertCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Application In Progress',
        message: 'Your application is being reviewed.'
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

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const getCurrentRound = () =>
    interviewRounds.find(
      (r) => r.status === 'WAITING' || r.status === 'ONGOING'
    )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobSeekerNavbar />
        <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobSeekerNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!application) return null

  const currentRound = getCurrentRound()
  const finalStatusConfig = getFinalStatusConfig(overallStatus)
  const StatusIcon = finalStatusConfig.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <JobSeekerNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => router.push('/jobseeker/dashboard')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowUpRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Dashboard
        </button>

        {/* Final Status */}
        <div
          className={`mb-8 rounded-xl p-6 border-2 ${finalStatusConfig.bgColor} ${finalStatusConfig.borderColor}`}
        >
          <div className="flex items-center">
            <StatusIcon
              className={`w-8 h-8 mr-4 ${finalStatusConfig.color}`}
            />
            <div>
              <h2 className={`text-xl font-bold ${finalStatusConfig.color}`}>
                {finalStatusConfig.title}
              </h2>
              <p className="text-sm opacity-80">
                {finalStatusConfig.message}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                Job Details
              </h2>

              <p className="font-semibold">{application.jobTitle}</p>
              <p className="text-sm text-gray-600">
                {application.companyName}
              </p>
              <p className="text-sm mt-2">
                Applied on: {formatDate(application.appliedAt)}
              </p>

              <span
                className={`inline-block mt-3 px-3 py-1 rounded-full text-sm border ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status}
              </span>
            </div>

            {currentRound && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Current Round
                </h3>
                <p>{currentRound.roundName}</p>
                <p className="text-sm">
                  Scheduled: {formatDate(currentRound.scheduledAt)}
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 bg-white rounded-xl border p-6">
            <RoundsTimeline rounds={interviewRounds} isReadOnly />
          </div>
        </div>
      </div>
    </div>
  )
}
