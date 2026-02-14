'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Info,
} from 'lucide-react';
import JobSeekerNavbar from '../JobComponents/JobSeekerNavbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusOptions = [
  { key: 'APPLIED', label: 'Applied', Icon: ClipboardList },
  { key: 'PROCESS', label: 'In Process', Icon: RefreshCw },
  { key: 'ACCEPTED', label: 'Accepted', Icon: CheckCircle },
  { key: 'REJECTED', label: 'Rejected', Icon: XCircle },
];

function statusBadgeClass(status) {
  switch (status) {
    case 'APPLIED':
      return 'bg-indigo-100 text-indigo-700 ring-indigo-200';
    case 'PROCESS':
      return 'bg-amber-100 text-amber-700 ring-amber-200';
    case 'ACCEPTED':
      return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-700 ring-rose-200';
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-200';
  }
}

function formatDate(dtString) {
  if (!dtString) return '—';
  try {
    const d = new Date(dtString);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dtString;
  }
}

export default function page() {
  const [activeTab, setActiveTab] = useState('APPLIED');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');

  const userId = useMemo(() => {
    // Prefer explicit `userId` from localStorage; fallback to decode if needed
    const stored = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    return stored ? Number(stored) : null;
  }, []);

  const authHeaders = useMemo(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  async function fetchApplications({ silent = false } = {}) {
    if (!API_URL) {
      setError('Missing NEXT_PUBLIC_API_URL');
      setLoading(false);
      return;
    }
    if (!userId) {
      setError('Missing userId; ensure it’s stored in localStorage.');
      setLoading(false);
      return;
    }
    try {
      if (!silent) setLoading(true);
      setError('');
      let res;
      try {
        // Try enhanced endpoint first
        res = await axios.get(`${API_URL}/jobApplications/user/${userId}/enhanced`, {
          headers: { ...authHeaders },
        });
      } catch (enhancedError) {
        console.warn('Enhanced endpoint failed, falling back to basic endpoint:', enhancedError.message);
        // Fallback to basic endpoint
        res = await axios.get(`${API_URL}/jobApplications/user/${userId}`, {
          headers: { ...authHeaders },
        });
      }
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to load applications';
      setError(String(msg));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const filtered = useMemo(() => {
    // Use the status from the application data (which now includes enhanced status from backend)
    const byTab = applications.filter((a) => a?.status === activeTab);
    if (!search.trim()) return byTab;
    const q = search.toLowerCase();
    return byTab.filter((a) => {
      const title = a?.job?.title || ''; // if the backend enriches with job object
      const jobId = String(a?.jobId || '');
      return title.toLowerCase().includes(q) || jobId.toLowerCase().includes(q);
    });
  }, [applications, activeTab, search]);

  const counts = useMemo(() => {
    return statusOptions.reduce((acc, s) => {
      acc[s.key] = applications.filter((a) => a?.status === s.key).length;
      return acc;
    }, {});
  }, [applications]);

  // Fetch interview rounds for an application
  async function fetchInterviewRounds(application) {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error('API_URL is not defined')
        return null
      }
      
      // Validate application data structure
      if (!application) {
        console.log('Application is null or undefined')
        return null
      }
      
      if (!application.user) {
        console.log('Application.user is missing:', application)
        return null
      }
      
      if (!application.user.id) {
        console.log('Application.user.id is missing:', application.user)
        return null
      }
      
      if (!application.jobId) {
        console.log('Application.jobId is missing:', application)
        return null
      }
      
      const url = `${API_URL}/api/interview-rounds/application/candidate/${application.user.id}/job/${application.jobId}`
      console.log('Fetching interview rounds from:', url)
      console.log('Headers:', authHeaders)
      
      const response = await axios.get(url, {
        headers: { ...authHeaders }
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
        color: application.status === 'ACCEPTED' ? 'emerald' : 
               application.status === 'REJECTED' ? 'rose' : 'indigo',
        roundsCompleted: 0,
        totalRounds: 0
      }
    }

    const totalRounds = rounds.length
    const completedRounds = rounds.filter(r => r.status === 'ACCEPTED' || r.status === 'REJECTED').length
    const acceptedRounds = rounds.filter(r => r.status === 'ACCEPTED').length
    const rejectedRounds = rounds.filter(r => r.status === 'REJECTED').length
    const lastRound = rounds[rounds.length - 1]

    // If any round is rejected, overall status is rejected
    if (rejectedRounds > 0) {
      return {
        status: 'REJECTED',
        label: `Rejected after ${completedRounds} round${completedRounds > 1 ? 's' : ''}`,
        color: 'rose',
        roundsCompleted: completedRounds,
        totalRounds: totalRounds
      }
    }

    // If all rounds completed and accepted
    if (completedRounds === totalRounds && acceptedRounds === totalRounds) {
      return {
        status: 'ACCEPTED',
        label: `Accepted after ${totalRounds} round${totalRounds > 1 ? 's' : ''}`,
        color: 'emerald',
        roundsCompleted: totalRounds,
        totalRounds: totalRounds
      }
    }

    // If there are ongoing rounds
    if (lastRound.status === 'WAITING') {
      return {
        status: 'PROCESS',
        label: `Waiting for round ${totalRounds}`,
        color: 'amber',
        roundsCompleted: completedRounds,
        totalRounds: totalRounds
      }
    }

    if (lastRound.status === 'ONGOING') {
      return {
        status: 'PROCESS',
        label: `Round ${totalRounds} ongoing`,
        color: 'purple',
        roundsCompleted: completedRounds,
        totalRounds: totalRounds
      }
    }

    // Default to application status
    return {
      status: application.status,
      label: application.status,
      color: application.status === 'ACCEPTED' ? 'emerald' : 
             application.status === 'REJECTED' ? 'rose' : 'indigo',
      roundsCompleted: completedRounds,
      totalRounds: totalRounds
    }
  }

  async function openDetails(app) {
    setSelectedApp(app);
    setJobDetails(null);
    setJobError('');
    if (!API_URL) {
      setJobError('Missing NEXT_PUBLIC_API_URL');
      return;
    }
    if (!app?.jobId) {
      setJobError('Missing jobId for this application');
      return;
    }
    try {
      setJobLoading(true);
      const res = await axios.get(`${API_URL}/jobs/${app.jobId}`, {
        headers: { ...authHeaders },
      });
      setJobDetails(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to load job details';
      setJobError(String(msg));
    } finally {
      setJobLoading(false);
    }
  }

  // Enhanced Application Card Component
  const EnhancedApplicationCard = ({ application, onOpenDetails }) => {
    const [enhancedStatus, setEnhancedStatus] = useState({
      status: application.status,
      label: application.status,
      color: 'indigo',
      roundsCompleted: 0,
      totalRounds: 0
    })
    const [interviewRounds, setInterviewRounds] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchData = async () => {
        try {
          console.log('EnhancedApplicationCard - Application data:', application)
          setLoading(true)
          const rounds = await fetchInterviewRounds(application)
          if (rounds && rounds.rounds) {
            const enhanced = getEnhancedStatus(application, rounds.rounds)
            setEnhancedStatus(enhanced)
            setInterviewRounds(rounds.rounds)
          } else {
            // Fallback to basic status if API fails or returns no data
            setEnhancedStatus({
              status: application.status,
              label: application.status,
              color: application.status === 'ACCEPTED' ? 'emerald' : 
                     application.status === 'REJECTED' ? 'rose' : 'indigo',
              roundsCompleted: 0,
              totalRounds: 0
            })
            setInterviewRounds([])
          }
        } catch (err) {
          console.error('Error fetching interview data:', err)
          // Fallback to basic status on error
          setEnhancedStatus({
            status: application.status,
            label: application.status,
            color: application.status === 'ACCEPTED' ? 'emerald' : 
                   application.status === 'REJECTED' ? 'rose' : 'indigo',
            roundsCompleted: 0,
            totalRounds: 0
          })
          setInterviewRounds([])
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }, [application])

    const getStatusIcon = () => {
      switch (enhancedStatus.status) {
        case 'PROCESS':
          return <RefreshCw className="h-4 w-4 inline mr-1" />
        case 'ACCEPTED':
          return <CheckCircle className="h-4 w-4 inline mr-1" />
        case 'REJECTED':
          return <XCircle className="h-4 w-4 inline mr-1" />
        default:
          return <ClipboardList className="h-4 w-4 inline mr-1" />
      }
    }

    const getStatusColor = () => {
      switch (enhancedStatus.color) {
        case 'amber':
          return 'bg-amber-100 text-amber-700 ring-amber-200'
        case 'purple':
          return 'bg-purple-100 text-purple-700 ring-purple-200'
        case 'emerald':
          return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
        case 'rose':
          return 'bg-rose-100 text-rose-700 ring-rose-200'
        default:
          return 'bg-indigo-100 text-indigo-700 ring-indigo-200'
      }
    }

    const getProgressColor = () => {
      if (enhancedStatus.status === 'REJECTED') return 'bg-rose-500'
      if (enhancedStatus.status === 'ACCEPTED') return 'bg-emerald-500'
      return 'bg-indigo-500'
    }

    if (loading) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {application?.job?.title || `Job #${application.jobId}`}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor()}`}
              >
                {getStatusIcon()}
                {enhancedStatus.label}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Job ID: <span className="font-mono">{application.jobId}</span>
            </p>
            {application?.job?.company && (
              <p className="text-sm text-gray-600">{application.job.company}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDetails(application)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
            >
              <Info className="h-5 w-5" />
              Details
            </button>
          </div>
        </div>

        {/* Interview Progress */}
        {enhancedStatus.totalRounds > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Interview Progress</span>
              <span className="text-sm text-gray-600">
                {enhancedStatus.roundsCompleted} / {enhancedStatus.totalRounds} rounds
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${(enhancedStatus.roundsCompleted / enhancedStatus.totalRounds) * 100}%` }}
              ></div>
            </div>
            
            {/* Recent Rounds */}
            {interviewRounds.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Rounds</div>
                {interviewRounds.slice(-2).map((round, index) => (
                  <div key={round.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{round.roundName}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      round.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                      round.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                      round.status === 'ONGOING' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {round.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Applied</p>
            <p className="mt-0.5 font-medium text-gray-800">{formatDate(application.appliedAt)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Updated</p>
            <p className="mt-0.5 font-medium text-gray-800">{formatDate(application.updatedAt)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Status</p>
            <p className="mt-0.5 font-medium text-gray-800">{enhancedStatus.label}</p>
          </div>
        </div>
      </div>
    )
  }

  function closeDetails() {
    setSelectedApp(null);
    setJobDetails(null);
    setJobError('');
    setJobLoading(false);
  }

  async function refresh() {
    setRefreshing(true);
    await fetchApplications({ silent: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <JobSeekerNavbar/>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 py-12 sm:py-16">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-white opacity-90" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Your Applications
              </h1>
            </div>
            <p className="mt-3 text-indigo-50 max-w-2xl">
              Track all your job applications by status and drill into details as needed.
            </p>

            {/* Toolbar */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-indigo-200" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by job title or ID..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>
              <button
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition disabled:opacity-60"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
              {statusOptions.map(({ key, label, Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                      active
                        ? 'bg-white text-indigo-700 border-white shadow-sm'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                    <span
                      className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        active ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white'
                      }`}
                    >
                      {counts[key] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-10">
        {/* Loading / Error / Empty */}
        {loading && (
          <div className="rounded-lg border border-indigo-100 bg-white p-6 text-indigo-700">
            Loading applications...
          </div>
        )}
        {!loading && error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-800 font-semibold">No applications in “{activeTab.toLowerCase()}”.</p>
            <p className="mt-1 text-gray-500">Try refreshing or adjusting your search.</p>
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filtered.map((app) => (
            <EnhancedApplicationCard key={app.id} application={app} onOpenDetails={openDetails} />
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <ApplicationDetailsModal 
          application={selectedApp}
          jobDetails={jobDetails}
          jobLoading={jobLoading}
          jobError={jobError}
          onClose={closeDetails}
          authHeaders={authHeaders}
        />
      )}
    </div>
  );
}

// Application Details Modal Component
function ApplicationDetailsModal({ application, jobDetails, jobLoading, jobError, onClose, authHeaders }) {
  const [interviewRounds, setInterviewRounds] = useState([])
  const [roundsLoading, setRoundsLoading] = useState(true)
  const [roundsError, setRoundsError] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
      const fetchRounds = async () => {
        if (!application?.user?.id || !application?.jobId) return
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) {
          console.error('API_URL is not defined in modal')
          setRoundsError('API configuration error')
          return
        }
        
        try {
          setRoundsLoading(true)
          setRoundsError('')
          const url = `${API_URL}/api/interview-rounds/application/candidate/${application.user.id}/job/${application.jobId}`
          console.log('Fetching interview rounds from modal:', url)
          const response = await axios.get(url, { headers: { ...authHeaders } })
          setInterviewRounds(response.data?.rounds || [])
        } catch (err) {
          console.error('Error fetching interview rounds:', err.response?.status, err.response?.data, err.message)
          setRoundsError('Failed to load interview rounds')
        } finally {
          setRoundsLoading(false)
        }
      }

      fetchRounds()
    }, [application, authHeaders])

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-2">
            <Info className="h-6 w-6 text-indigo-600" />
            <h4 className="text-lg font-semibold text-gray-900">
              {application?.job?.title || `Job #${application?.jobId}`}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        <div className="p-5">
          {jobLoading && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-indigo-700">
              Loading job details...
            </div>
          )}
          {!jobLoading && jobError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
              {jobError}
            </div>
          )}
          {!jobLoading && !jobError && jobDetails && (
            <div className="space-y-6">
              {/* Job Details */}
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Job Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="mt-1 font-medium text-gray-900">{jobDetails.company || '—'}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="mt-1 font-medium text-gray-900">{jobDetails.location || '—'}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Job Type</p>
                    <p className="mt-1 font-medium text-gray-900">{jobDetails.job_type || '—'}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Salary Range</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {jobDetails.salaryRange ? `${jobDetails.salaryRange}` : '—'}
                    </p>
                  </div>
                </div>
                {jobDetails.description && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-gray-900">{jobDetails.description}</p>
                  </div>
                )}
              </div>

              {/* Interview Rounds */}
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Interview Rounds</h5>
                {roundsLoading && (
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-indigo-700">
                    Loading interview rounds...
                  </div>
                )}
                {!roundsLoading && roundsError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
                    {roundsError}
                  </div>
                )}
                {!roundsLoading && !roundsError && interviewRounds.length === 0 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-600 text-center">
                    No interview rounds scheduled yet
                  </div>
                )}
                {!roundsLoading && !roundsError && interviewRounds.length > 0 && (
                  <div className="space-y-3">
                    {/* Progress Summary */}
                    <div className="rounded-lg bg-indigo-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-900">Progress</span>
                        <span className="text-sm text-indigo-700">
                          {interviewRounds.filter(r => r.status === 'ACCEPTED' || r.status === 'REJECTED').length} / {interviewRounds.length} rounds completed
                        </span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(interviewRounds.filter(r => r.status === 'ACCEPTED' || r.status === 'REJECTED').length / interviewRounds.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Rounds Timeline */}
                    <div className="space-y-2">
                      {interviewRounds.map((round, index) => (
                        <div key={round.id} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-medium text-gray-900">{round.roundName}</h6>
                              <p className="text-sm text-gray-600">{round.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {round.mode} • {formatDate(round.scheduledAt)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              round.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                              round.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                              round.status === 'ONGOING' ? 'bg-purple-100 text-purple-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {round.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Application Timeline */}
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Application Timeline</h5>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Applied</p>
                      <p className="text-xs text-gray-500">{formatDate(application.appliedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">{formatDate(application.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
                {/* Job Details */}
                {!jobLoading && !jobError && jobDetails && (
                  <div className="space-y-3">
                    <p className="text-gray-800">
                      <span className="font-semibold">Company:</span>{' '}
                      {jobDetails.company || '—'}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-semibold">Location:</span>{' '}
                      {jobDetails.location || '—'}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-semibold">Type:</span>{' '}
                      {jobDetails.job_type || jobDetails.jobType || '—'}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-semibold">Posted:</span>{' '}
                      {formatDate(jobDetails.created_at || jobDetails.createdAt)}
                    </p>
                    {jobDetails.description && (
                      <div>
                        <p className="font-semibold text-gray-900">Description</p>
                        <p className="mt-1 text-gray-700">{jobDetails.description}</p>
                      </div>
                    )}
                    {jobDetails.skills && Array.isArray(jobDetails.skills) && jobDetails.skills.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-900">Skills</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {jobDetails.skills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!jobLoading && !jobError && !jobDetails && (
                  <div className="text-gray-600">No extra details available for this job.</div>
                )}
            </div>
            </div>
          </div>
       
      
  )
}