'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import RecruiterNavbar from '../../RecruiterComponents/RecruiterNavbar'
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
  AlertCircle
} from 'lucide-react'

function page() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id
  
  const [applications, setApplications] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)
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
        
        // Fetch applications for this job
        const applicationsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/job/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
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

  // Update application status
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      setUpdateLoading(true)
      const token = localStorage.getItem('token')
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/status/${applicationId}?status=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ))
      
      setMessage({ 
        type: 'success', 
        text: `Application ${newStatus === 'ACCEPTED' ? 'accepted' : 'rejected'} successfully!` 
      })
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error('Error updating application status:', err)
      setMessage({ 
        type: 'error', 
        text: 'Failed to update application status. Please try again.' 
      })
    } finally {
      setUpdateLoading(false)
    }
  }

  // Filter applications by status and search term
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
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
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        application.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status === 'APPLIED' && <Clock className="w-4 h-4 inline mr-1" />}
                        {application.status === 'ACCEPTED' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                        {application.status === 'REJECTED' && <XCircle className="w-4 h-4 inline mr-1" />}
                        {application.status}
                      </div>
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
                      {application.status === 'APPLIED' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            disabled={updateLoading}
                            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Reject
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                            disabled={updateLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Accept
                          </button>
                        </>
                      )}
                      {application.status === 'ACCEPTED' && (
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                          disabled={updateLoading}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4 inline mr-1" />
                          Reject Instead
                        </button>
                      )}
                      {application.status === 'REJECTED' && (
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                          disabled={updateLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Accept Instead
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default page