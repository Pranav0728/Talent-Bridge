'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import RecruiterNavbar from '../../RecruiterComponents/RecruiterNavbar'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  ChevronLeft,
  Download,
  Globe,
  Github,
  Linkedin,
  FileText,
  Award,
  Building,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

function page() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id
  
  const [userProfile, setUserProfile] = useState(null)
  const [userApplications, setUserApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user profile and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        // Fetch user profile
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/userProfile/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setUserProfile(profileResponse.data)
        
        // Fetch user's job applications
        const applicationsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setUserApplications(applicationsResponse.data)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load user profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      fetchData()
    }
  }, [userId])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'APPLIED':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock }
      case 'ACCEPTED':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'REJECTED':
        return { color: 'bg-red-100 text-red-800', icon: XCircle }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock }
    }
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
              <h3 className="text-lg font-medium text-red-800">Error Loading Profile</h3>
              <p className="mt-1 text-red-700">{error}</p>
              <button 
                onClick={() => router.back()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Profile Not Found</h3>
            <p className="text-gray-600">This user hasn't created a profile yet.</p>
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
              {userProfile.firstName} {userProfile.lastName}
            </h1>
          </div>
          <p className="text-gray-600 ml-10">
            {userProfile.headline || 'Job Seeker Profile'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {userProfile.firstName?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {userProfile.firstName} {userProfile.lastName}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    {userProfile.headline || 'Professional Profile'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <span>{userProfile.email || '—'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span>{userProfile.phoneNumber || '—'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span>{userProfile.location || '—'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Building className="w-5 h-5 text-gray-400 mr-3" />
                      <span>{userProfile.currentCompany || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                Professional Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Position</label>
                  <p className="text-gray-900">{userProfile.jobTitle || '—'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience Level</label>
                  <p className="text-gray-900">{userProfile.experienceLevel || '—'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Industry</label>
                  <p className="text-gray-900">{userProfile.industry || '—'}</p>
                </div>
                
                {userProfile.jobDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Job Description</label>
                    <p className="text-gray-900 mt-1">{userProfile.jobDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {userProfile.skills && userProfile.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-600" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(userProfile.linkedinUrl || userProfile.githubUrl || userProfile.portfolioUrl) && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-purple-600" />
                  Online Presence
                </h3>
                <div className="space-y-3">
                  {userProfile.linkedinUrl && (
                    <a
                      href={userProfile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Linkedin className="w-5 h-5 mr-2" />
                      LinkedIn Profile
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                  {userProfile.githubUrl && (
                    <a
                      href={userProfile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      GitHub Profile
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                  {userProfile.portfolioUrl && (
                    <a
                      href={userProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-800"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      Portfolio Website
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Resume Download */}
            {userProfile.resume && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-600" />
                  Resume
                </h3>
                <a
                  href={userProfile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </a>
              </div>
            )}
          </div>

          {/* Right Column - Applications */}
          <div className="space-y-6">
            {/* Application History */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Application History
              </h3>
              
              {userApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No applications found</p>
              ) : (
                <div className="space-y-3">
                  {userApplications.slice(0, 5).map((application) => {
                    const statusInfo = getStatusInfo(application.status)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <div key={application.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Job #{application.jobId}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {application.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Applied on {formatDate(application.appliedAt)}
                        </p>
                      </div>
                    )
                  })}
                  
                  {userApplications.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{userApplications.length - 5} more applications
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                Profile Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Applications</span>
                  <span className="font-semibold text-gray-900">{userApplications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accepted</span>
                  <span className="font-semibold text-green-600">
                    {userApplications.filter(app => app.status === 'ACCEPTED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-blue-600">
                    {userApplications.filter(app => app.status === 'APPLIED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Created</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(userProfile.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
