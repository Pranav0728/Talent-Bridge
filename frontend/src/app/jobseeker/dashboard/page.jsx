
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import JobSeekerNavbar from '../JobComponents/JobSeekerNavbar'
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Star,
  AlertCircle,
  RefreshCw,
  Target,
  Award,
  Activity,
  BookOpen,
  Zap
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    profileCompletion: 0,
    jobsViewed: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      console.log('Jobseeker dashboard fetch started:', { token: !!token, userId })
      
      if (!token || !userId) {
        router.push('/unauthorized')
        return
      }

      // Fetch user profile
      let profileData = null
      try {
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/userProfile/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        profileData = profileResponse.data
        setUserProfile(profileData)
      } catch (profileErr) {
        console.log('Profile not found:', profileErr.response?.status)
        // Continue without profile data
      }

      // Fetch user's applications
      let applicationsData = []
      try {
        const applicationsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        applicationsData = applicationsResponse.data
        setApplications(applicationsData)
      } catch (appErr) {
        console.log('No applications found:', appErr.response?.status)
      }

      // Fetch recent jobs (for recommendations)
      let jobsData = []
      try {
        const jobsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        jobsData = jobsResponse.data.slice(0, 6) // Get recent 6 jobs
        setJobs(jobsData)
      } catch (jobsErr) {
        console.log('No jobs found:', jobsErr.response?.status)
      }

      // Calculate profile completion
      const profileCompletion = calculateProfileCompletion(profileData)

      // Calculate stats
      const stats = {
        totalApplications: applicationsData.length,
        pendingApplications: applicationsData.filter(app => app.status === 'APPLIED').length,
        acceptedApplications: applicationsData.filter(app => app.status === 'ACCEPTED').length,
        rejectedApplications: applicationsData.filter(app => app.status === 'REJECTED').length,
        profileCompletion: profileCompletion,
        jobsViewed: jobsData.length
      }
      setStats(stats)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(`Failed to load dashboard data: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0
    
    const fields = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'headline', 
      'currentCompany', 'experienceLevel', 'jobTitle', 'jobDescription',
      'industry', 'location', 'skills', 'resume', 'linkedinUrl'
    ]
    
    const completedFields = fields.filter(field => {
      const value = profile[field]
      return value && value.toString().trim() !== ''
    }).length
    
    return Math.round((completedFields / fields.length) * 100)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPLIED': return Clock
      case 'ACCEPTED': return CheckCircle
      case 'REJECTED': return XCircle
      default: return Clock
    }
  }

  // Chart data
  const applicationStatusData = [
    { name: 'Applied', value: stats.pendingApplications, color: '#3B82F6' },
    { name: 'Accepted', value: stats.acceptedApplications, color: '#10B981' },
    { name: 'Rejected', value: stats.rejectedApplications, color: '#EF4444' }
  ]

  const monthlyApplicationsData = [
    { month: 'Jan', applications: 2 },
    { month: 'Feb', applications: 4 },
    { month: 'Mar', applications: 3 },
    { month: 'Apr', applications: 6 },
    { month: 'May', applications: 5 },
    { month: 'Jun', applications: stats.totalApplications }
  ]

  const skillsData = userProfile?.skills?.slice(0, 5).map(skill => ({
    skill,
    value: Math.floor(Math.random() * 20) + 10 // Mock proficiency data
  })) || []

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
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="mt-1 text-red-700">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <JobSeekerNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.firstName || 'Job Seeker'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Track your job search progress and discover new opportunities
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/jobseeker/jobs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Link>
              <Link
                href="/jobseeker/profile"
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Complete</p>
                <p className="text-2xl font-bold text-gray-900">{stats.profileCompletion}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Application Status Chart */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
              Application Status
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {applicationStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Applications Trend */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Application Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyApplicationsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-600" />
              Profile Strength
            </h3>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.profileCompletion / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{stats.profileCompletion}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {stats.profileCompletion < 50 
                  ? "Complete your profile to get more visibility" 
                  : stats.profileCompletion < 80 
                  ? "Great progress! Keep improving your profile"
                  : "Excellent! Your profile is well-optimized"}
              </p>
              <Link
                href="/jobseeker/profile"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                {stats.profileCompletion < 50 ? 'Complete Profile' : 'Update Profile'}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Recent Applications
              </h2>
              <Link
                href="/jobseeker/applications"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Applications Yet</h3>
                <p className="text-gray-600 mb-4">Start applying to jobs to track your progress here.</p>
                <Link
                  href="/jobseeker/jobs"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => {
                  const StatusIcon = getStatusIcon(application.status)
                  return (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Job #{application.jobId}
                            </h3>
                            <p className="text-sm text-gray-600">Applied on {formatDate(application.appliedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {application.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                Recommended Jobs
              </h2>
              <Link
                href="/jobseeker/jobs"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Jobs Available</h3>
                <p className="text-gray-600 mb-4">Check back later for new job opportunities.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 4).map((job) => (
                  <div key={job.jobId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{job.jobTitle}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                          <span className="mx-2">•</span>
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(job.created_at)}
                        </div>
                        {job.salary && (
                          <div className="flex items-center text-xs text-green-600 mt-1">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${job.salary.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/jobseeker/jobs`}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/jobseeker/jobs"
              className="flex items-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Briefcase className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-900">Browse Jobs</span>
            </Link>
            <Link
              href="/jobseeker/applications"
              className="flex items-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <FileText className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-900">My Applications</span>
            </Link>
            <Link
              href="/jobseeker/profile"
              className="flex items-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <Users className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-purple-900">Edit Profile</span>
            </Link>
            <Link
              href="/jobseeker/jobs"
              className="flex items-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <Zap className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-orange-900">Quick Apply</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
