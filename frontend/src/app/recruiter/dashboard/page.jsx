'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import RecruiterNavbar from '../RecruiterComponents/RecruiterNavbar'
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
  Edit,
  Trash2,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  RefreshCw,
  Target,
  Award,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recruiter, setRecruiter] = useState(null)
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    recentApplications: 0,
    conversionRate: 0,
    avgApplicationsPerJob: 0,
    topPerformingJob: null
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
      
      console.log('Dashboard fetch started:', { token: !!token, userId, apiUrl: process.env.NEXT_PUBLIC_API_URL })
      
      if (!token || !userId) {
        console.log('Missing token or userId, redirecting to unauthorized')
        router.push('/unauthorized')
        return
      }

      // Fetch recruiter profile
      console.log('Fetching recruiter profile...')
      let recruiterData = null
      try {
        const recruiterResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        console.log('Recruiter data:', recruiterResponse.data)
        recruiterData = recruiterResponse.data
        setRecruiter(recruiterData)
      } catch (recruiterErr) {
        console.log('Recruiter profile not found, user might not be a recruiter yet:', recruiterErr.response?.status)
        if (recruiterErr.response?.status === 404) {
          setError('Recruiter profile not found. Please complete your recruiter registration first.')
          return
        }
        throw recruiterErr
      }

      // Fetch recruiter's jobs
      console.log('Fetching jobs for recruiter:', recruiterData.recruiterId)
      let jobsData = []
      try {
        const jobsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/recruiter/${recruiterData.recruiterId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        console.log('Jobs data:', jobsResponse.data)
        console.log('First job structure:', jobsResponse.data[0])
        jobsData = jobsResponse.data
        setJobs(jobsData)
      } catch (jobsErr) {
        console.log('No jobs found or error fetching jobs:', jobsErr.response?.status)
        // Continue with empty jobs array
      }

      // Fetch all applications for recruiter's jobs
      console.log('Fetching applications for jobs...')
      const allApplications = []
      for (const job of jobsData) {
        try {
          console.log(`Fetching applications for job ${job.jobId}`)
          const applicationsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/job/${job.jobId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          )
          console.log(`Found ${applicationsResponse.data.length} applications for job ${job.jobId}`)
          allApplications.push(...applicationsResponse.data.map(app => ({ ...app, jobTitle: job.jobTitle || 'Untitled Job' })))
        } catch (err) {
          console.log(`No applications for job ${job.jobId}:`, err.response?.status || err.message)
        }
      }
      console.log('Total applications:', allApplications.length)
      setApplications(allApplications)

      // Calculate detailed stats
      const pendingApps = allApplications.filter(app => app.status === 'APPLIED').length
      const acceptedApps = allApplications.filter(app => app.status === 'ACCEPTED').length
      const rejectedApps = allApplications.filter(app => app.status === 'REJECTED').length
      const recentApps = allApplications.filter(app => {
        const appDate = new Date(app.appliedAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return appDate > weekAgo
      }).length

      // Calculate conversion rate
      const conversionRate = allApplications.length > 0 
        ? Math.round((acceptedApps / allApplications.length) * 100) 
        : 0

      // Calculate average applications per job
      const avgApplicationsPerJob = jobsData.length > 0 
        ? Math.round(allApplications.length / jobsData.length) 
        : 0

      // Find top performing job
      const jobApplicationCounts = jobsData.map(job => ({
        jobId: job.jobId,
        jobTitle: job.jobTitle || 'Untitled Job',
        applicationCount: allApplications.filter(app => app.jobId === job.jobId).length
      }))
      const topPerformingJob = jobApplicationCounts.reduce((max, job) => 
        job.applicationCount > max.applicationCount ? job : max, 
        { applicationCount: 0, jobTitle: 'No jobs yet' }
      )

      const stats = {
        totalJobs: jobsData.length,
        totalApplications: allApplications.length,
        pendingApplications: pendingApps,
        acceptedApplications: acceptedApps,
        rejectedApplications: rejectedApps,
        recentApplications: recentApps,
        conversionRate: conversionRate,
        avgApplicationsPerJob: avgApplicationsPerJob,
        topPerformingJob: topPerformingJob
      }
      console.log('Calculated stats:', stats)
      setStats(stats)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      })
      setError(`Failed to load dashboard data: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
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
    { month: 'Jan', applications: 8, accepted: 2 },
    { month: 'Feb', applications: 12, accepted: 3 },
    { month: 'Mar', applications: 15, accepted: 4 },
    { month: 'Apr', applications: 18, accepted: 5 },
    { month: 'May', applications: 22, accepted: 6 },
    { month: 'Jun', applications: stats.totalApplications, accepted: stats.acceptedApplications }
  ]

  const jobPerformanceData = jobs.slice(0, 5).map(job => ({
    jobTitle: job.jobTitle && job.jobTitle.length > 20 ? job.jobTitle.substring(0, 20) + '...' : (job.jobTitle || 'Untitled Job'),
    applications: applications.filter(app => app.jobId === job.jobId).length,
    accepted: applications.filter(app => app.jobId === job.jobId && app.status === 'ACCEPTED').length
  }))

  const weeklyTrendData = [
    { day: 'Mon', applications: 3, accepted: 1 },
    { day: 'Tue', applications: 5, accepted: 2 },
    { day: 'Wed', applications: 4, accepted: 1 },
    { day: 'Thu', applications: 6, accepted: 3 },
    { day: 'Fri', applications: 8, accepted: 2 },
    { day: 'Sat', applications: 2, accepted: 1 },
    { day: 'Sun', applications: 1, accepted: 0 }
  ]

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
      <RecruiterNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {recruiter?.company_name || 'Recruiter'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your recruitment activities
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/recruiter/jobs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Manage Jobs
              </Link>
              <Link
                href="/recruiter/company"
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Company Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg shadow-md">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Total Jobs</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalJobs}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="font-medium">+12%</span>
                </div>
                <p className="text-xs text-blue-600">vs last month</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Total Applications</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalApplications}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="font-medium">+{stats.avgApplicationsPerJob}</span>
                </div>
                <p className="text-xs text-green-600">avg per job</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg border border-yellow-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500 rounded-lg shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">Pending Reviews</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingApplications}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-yellow-600 text-sm">
                  <Target className="w-4 h-4 mr-1" />
                  <span className="font-medium">Action needed</span>
                </div>
                <p className="text-xs text-yellow-600">Review required</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-lg shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Conversion Rate</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.conversionRate}%</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-purple-600 text-sm">
                  <Award className="w-4 h-4 mr-1" />
                  <span className="font-medium">Success</span>
                </div>
                <p className="text-xs text-purple-600">Acceptance rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <RechartsPieChart className="w-6 h-6 mr-3 text-blue-600" />
              Application Status Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Applications']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {applicationStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">{item.value}</span>
                    <span className="text-xs text-gray-500">
                      ({stats.totalApplications > 0 ? Math.round((item.value / stats.totalApplications) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Applications Trend */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
              Monthly Application Trends
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyApplicationsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Line 
                    type="monotone" 
                    dataKey="accepted" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Total Applications</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Accepted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Performance and Weekly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Job Performance Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-indigo-600" />
              Job Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="jobTitle" 
                    stroke="#666"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accepted" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Applications</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Accepted</span>
              </div>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-purple-600" />
              Weekly Activity
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorApplications)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="accepted" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorAccepted)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Applications</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Accepted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Applications
                </h2>
                <Link
                  href="/recruiter/jobs"
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
                  <p className="text-gray-600 mb-4">Applications will appear here once candidates apply to your jobs.</p>
                  <Link
                    href="/recruiter/jobs"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job Posting
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
                              {application.user?.firstName?.[0] || 'U'}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {application.user?.firstName} {application.user?.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{application.jobTitle}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {application.status}
                            </span>
                            <Link
                              href={`/recruiter/applications/${application.jobId}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Applied on {formatDate(application.appliedAt)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Top Performing Job */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                Top Performing Job
              </h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {stats.topPerformingJob.jobTitle}
                </h4>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {stats.topPerformingJob.applicationCount}
                </div>
                <p className="text-sm text-gray-600">Applications received</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Zap className="w-3 h-3 mr-1" />
                    Best Performer
                  </span>
                </div>
              </div>
            </div>

            {/* Application Status Breakdown */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-600" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Applied</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{stats.pendingApplications}</span>
                    <p className="text-xs text-gray-500">
                      {stats.totalApplications > 0 ? Math.round((stats.pendingApplications / stats.totalApplications) * 100) : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Accepted</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{stats.acceptedApplications}</span>
                    <p className="text-xs text-gray-500">
                      {stats.totalApplications > 0 ? Math.round((stats.acceptedApplications / stats.totalApplications) * 100) : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Rejected</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{stats.rejectedApplications}</span>
                    <p className="text-xs text-gray-500">
                      {stats.totalApplications > 0 ? Math.round((stats.rejectedApplications / stats.totalApplications) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                  Recent Jobs
                </h3>
                <Link
                  href="/recruiter/jobs"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View All
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
              
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted Yet</h4>
                  <p className="text-sm text-gray-600 mb-4">Create your first job posting to start receiving applications.</p>
                  <Link
                    href="/recruiter/jobs"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => {
                    const jobApplications = applications.filter(app => app.jobId === job.jobId)
                    return (
                      <div key={job.jobId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2">{job.jobTitle || 'Untitled Job'}</h4>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <MapPin className="w-3 h-3 mr-1" />
                              {job.location || 'Location not specified'}
                              <span className="mx-2">•</span>
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(job.created_at)}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {jobApplications.length} applications
                                </span>
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                  {jobApplications.filter(app => app.status === 'ACCEPTED').length} accepted
                                </span>
                              </div>
                              <Link
                                href={`/recruiter/applications/${job.jobId}`}
                                className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg border border-purple-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/recruiter/jobs"
                  className="flex items-center p-4 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
                >
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Create New Job</span>
                    <p className="text-xs text-gray-500">Post a new job opening</p>
                  </div>
                </Link>

                <Link
                  href="/recruiter/company"
                  className="flex items-center p-4 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
                >
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Update Company</span>
                    <p className="text-xs text-gray-500">Manage company profile</p>
                  </div>
                </Link>

                <Link
                  href="/recruiter/applications"
                  className="flex items-center p-4 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
                >
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Review Applications</span>
                    <p className="text-xs text-gray-500">Manage candidate applications</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
