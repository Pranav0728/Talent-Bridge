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
  { key: 'ACCEPTED', label: 'Accepted', Icon: CheckCircle },
  { key: 'REJECTED', label: 'Rejected', Icon: XCircle },
];

function statusBadgeClass(status) {
  switch (status) {
    case 'APPLIED':
      return 'bg-indigo-100 text-indigo-700 ring-indigo-200';
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
      const res = await axios.get(`${API_URL}/jobApplications/user/${userId}`, {
        headers: { ...authHeaders },
      });
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
            <div
              key={app.id}
              className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app?.job?.title || `Job #${app.jobId}`}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusBadgeClass(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Job ID: <span className="font-mono">{app.jobId}</span>
                  </p>
                  {app?.job?.company && (
                    <p className="text-sm text-gray-600">{app.job.company}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDetails(app)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                  >
                    <Info className="h-5 w-5" />
                    Details
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Applied</p>
                  <p className="mt-0.5 font-medium text-gray-800">{formatDate(app.appliedAt)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Updated</p>
                  <p className="mt-0.5 font-medium text-gray-800">{formatDate(app.updatedAt)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Status</p>
                  <p className="mt-0.5 font-medium text-gray-800">{app.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div className="flex items-center gap-2">
                <Info className="h-6 w-6 text-indigo-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedApp?.job?.title || `Job #${selectedApp?.jobId}`}
                </h4>
              </div>
              <button
                onClick={closeDetails}
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
      )}
    </div>
  );
}