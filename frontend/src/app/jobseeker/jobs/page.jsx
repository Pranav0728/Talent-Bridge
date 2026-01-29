"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import JobSeekerNavbar from "../JobComponents/JobSeekerNavbar";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building2,
  X,
  Phone,
  Globe,
  Linkedin,
  ShieldCheck,
} from "lucide-react";
import SkillMatchResult from "@/app/componets/SkillMatchResult";

export default function page() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [recruiters, setRecruiters] = useState({});
  const [type, setType] = useState("All");
  const [location, setLocation] = useState("All");
  const [minSalary, setMinSalary] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyLoading, setApplyLoading] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const jobTypes = [
    "All",
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Remote",
  ];

  useEffect(() => {
    const fetchUserId = async () => {
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      setUserId(userId || null);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setJobs(res.data || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Unable to fetch jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const uniqueRecruiterIds = [
      ...new Set(
        jobs
          .map((job) => job.recruiter?.recruiterId || job.recruiter_id)
          .filter(Boolean),
      ),
    ];

    if (uniqueRecruiterIds.length === 0) return;

    const fetchRecruiters = async () => {
      try {
        const recruiterData = {};
        await Promise.all(
          uniqueRecruiterIds.map(async (id) => {
            const res = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/${id}`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              },
            );
            recruiterData[id] = res.data;
          }),
        );
        setRecruiters(recruiterData);
      } catch (err) {
        console.error("Error fetching recruiters:", err);
        setError("Unable to fetch recruiters. Please try again.");
      }
    };

    fetchRecruiters();
  }, [jobs]);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch applied jobs
        const appliedRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/user/${userId}`,
          { headers },
        );
        setAppliedJobs(new Set(appliedRes.data.map((app) => app.jobId)));

        // Fetch user profile
        const profileRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/userProfile/user/${userId}`,
          { headers },
        );
        setUserProfile(profileRes.data);
        console.log("UserProfile: " + profileRes.data.skills);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchData();
  }, [userId]);

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    const num = Number(salary);
    if (Number.isNaN(num)) return "Not specified";
    return `${num.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Submit job application
  console.log(appliedJobs);
  const submitApplyForm = async (job) => {
    try {
      setApplyLoading(true);
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        alert("Please login to apply for jobs");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/jobApplications/apply?userId=${userId}&jobId=${job.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        // Add job to applied jobs set
        console.log("id" + job.id);
        setAppliedJobs((prev) => new Set([...prev, job.id]));
      }
    } catch (error) {
      console.error("Error applying for job:", error);

      if (error.response?.status === 409) {
        alert("You have already applied for this job!");
      } else if (error.response?.status === 401) {
        alert("Please login to apply for jobs");
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } finally {
      setApplyLoading(false);
    }
  };

  const normalizeRecruiter = (r) => ({
    recruiterId: r?.recruiterId ?? r?.id ?? null,
    company_name: r?.company_name ?? r?.companyName ?? "Unknown Company",
    company_description: r?.company_description ?? r?.companyDescription ?? "",
    company_website: r?.company_website ?? r?.companyWebsite ?? "",
    company_logo: r?.company_logo ?? r?.companyLogo ?? "",
    industry: r?.industry ?? "",
    established_year: r?.established_year ?? r?.establishedYear ?? null,
    location: r?.location ?? "",
    phone_number: r?.phone_number ?? r?.phoneNumber ?? "",
    linkedin_url: r?.linkedin_url ?? r?.linkedinUrl ?? "",
    is_verified: Boolean(r?.is_verified),
    created_at: r?.created_at ?? r?.createdAt ?? null,
    updated_at: r?.updated_at ?? r?.updatedAt ?? null,
  });
  const normalizedJobs = useMemo(() => {
    return (jobs || []).map((job) => {
      const jobSkills = job.skills ?? ["reactjs", "nodejs", "mongodb"];
      
      // Calculate match score
      let matchScore = 0;
      if (userProfile?.skills && jobSkills.length > 0) {
        const userSkillsLower = userProfile.skills.map((s) => s.toLowerCase());
        const jobSkillsLower = jobSkills.map((s) => s.toLowerCase());
        const matchCount = jobSkillsLower.filter((skill) =>
          userSkillsLower.some(
            (userSkill) =>
              userSkill.includes(skill) || skill.includes(userSkill),
          ),
        ).length;
        matchScore = Math.round((matchCount / jobSkillsLower.length) * 100);
      }

      return {
        id: job.job_id ?? job.jobId ?? job.id,
        title: job.job_title ?? job.jobTitle ?? "Untitled Role",
        company: job.company ?? job.company_name ?? "Confidential",
        location: job.location ?? "Remote",
        description: job.description ?? "",
        type: job.job_type ?? job.jobType ?? "—",
        salary: job.salary ?? job.min_salary ?? null,
        postedAt: job.created_at ?? job.createdAt ?? job.posted_at ?? null,
        skills: jobSkills,
        matchScore,
        recruiter_id:
          job.recruiter?.recruiterId ??
          job.recruiter_id ??
          job.recruiterId ??
          null,
      };
    });
  }, [jobs, userProfile]);

  // Handlers for modals
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    console.log("SelectedJob: " + job.skills);
    setShowApplyModal(true);
  };
  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
  };

  const handleDetailsClick = async (recruiterId) => {
    if (!recruiterId) return;
    setShowDetailsModal(true);
    setDetailsLoading(true);
    try {
      // Use cached recruiter if present, else fetch
      let data = recruiters[recruiterId];
      if (!data) {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/recruiters/${recruiterId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        data = res.data;
      }
      setSelectedRecruiter(normalizeRecruiter(data));
    } catch (err) {
      console.error("Error fetching recruiter details:", err);
      setError("Unable to load recruiter details.");
    } finally {
      setDetailsLoading(false);
    }
  };
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRecruiter(null);
  };

  const filteredJobs = useMemo(() => {
    let list = normalizedJobs;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q),
      );
    }

    // Type filter
    if (type !== "All") {
      list = list.filter(
        (j) => (j.type || "").toLowerCase() === type.toLowerCase(),
      );
    }

    // Location filter
    if (location !== "All") {
      list = list.filter((j) =>
        (j.location || "").toLowerCase().includes(location.toLowerCase()),
      );
    }

    // Salary threshold
    if (minSalary && !Number.isNaN(Number(minSalary))) {
      list = list.filter((j) => Number(j.salary || 0) >= Number(minSalary));
    }

    // Sorting
    if (sortBy === "recent") {
      list = list.sort(
        (a, b) =>
          new Date(b.postedAt || 0).getTime() -
          new Date(a.postedAt || 0).getTime(),
      );
    } else if (sortBy === "salary") {
      list = list.sort((a, b) => Number(b.salary || 0) - Number(a.salary || 0));
    } else if (sortBy === "match") {
      list = list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return list;
  }, [normalizedJobs, search, type, location, minSalary, sortBy]);

  const SkeletonCard = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-3/4 rounded bg-gray-200" />
        <div className="flex items-center space-x-3">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200" />
        </div>
        <div className="h-16 w-full rounded bg-gray-200" />
        <div className="flex space-x-2">
          <div className="h-8 w-24 rounded bg-gray-200" />
          <div className="h-8 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <JobSeekerNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-10">
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white shadow-xl">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_60%)]" />
            <div className="relative">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                Find your next role with confidence
              </h1>
              <p className="mt-3 text-sm md:text-base text-indigo-100">
                Personalized filters, modern UI, and curated listings for job
                seekers.
              </p>

              {/* Search & Filters */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                <div className="col-span-2 flex items-center rounded-xl bg-white/10 backdrop-blur px-3 py-2 ring-1 ring-white/30 focus-within:ring-2">
                  <Search className="mr-2 h-5 w-5 text-white/90" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent placeholder-white/70 text-white outline-none"
                    placeholder="Search by title, company, or keywords"
                  />
                </div>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-xl bg-white/10 text-white px-3 py-2 ring-1 ring-white/30 focus:ring-2"
                >
                  {jobTypes.map((t) => (
                    <option key={t} value={t} className="bg-indigo-600">
                      {t}
                    </option>
                  ))}
                </select>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-xl bg-white/10 text-white px-3 py-2 ring-1 ring-white/30 placeholder-white/70 focus:ring-2"
                  placeholder="Location (e.g., Mumbai)"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <input
                  type="number"
                  min="0"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="rounded-xl bg-white/10 text-white px-3 py-2 ring-1 ring-white/30 placeholder-white/70 focus:ring-2"
                  placeholder="Min Salary ($)"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl bg-white/10 text-white px-3 py-2 ring-1 ring-white/30 focus:ring-2"
                >
                  <option value="recent" className="bg-indigo-600">
                    Sort by Recent
                  </option>
                  <option value="salary" className="bg-indigo-600">
                    Sort by Salary
                  </option>
                  <option value="match" className="bg-indigo-600">
                    Sort by Match %
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        {/* Status */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <p className="text-gray-700">
              No jobs found. Try adjusting your filters or search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, idx) => (
              <article
                key={job.id ?? idx}
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                      <span>
                        {recruiters[job.recruiter_id]?.company_name ||
                          recruiters[job.recruiter_id]?.companyName ||
                          "Unknown Company"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                    {job.matchScore > 0 && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-100">
                        {job.matchScore}% Match
                      </span>
                    )}
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
                      {job.type}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <DollarSign className=" h-4 w-4 text-green-600" />
                    <span className="text-sm">{formatSalary(job.salary)}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-4 max-h-[4.5rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 text-sm text-gray-700">
                  {job.description}
                </p>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center text-gray-500">
                    <Clock className="mr-2 h-4 w-4" />
                    <span className="text-xs">
                      Posted {formatDate(job.postedAt)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all duration-300 focus-visible:ring-2 ${
                        appliedJobs.has(job.id)
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md focus-visible:ring-indigo-400"
                      }`}
                      onClick={() =>
                        !appliedJobs.has(job.id) && handleApplyClick(job)
                      }
                      disabled={appliedJobs.has(job.id)}
                    >
                      {appliedJobs.has(job.id) ? "Applied" : "Apply"}
                    </button>
                    <button
                      disabled={!job.recruiter_id}
                      className=" rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-300 hover:bg-gray-200"
                      onClick={() => handleDetailsClick(job.recruiter_id)}
                    >
                      Details
                    </button>
                  </div>
                </div>
                {/* ... existing code ... */}
              </article>
            ))}
          </div>
        )}

        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200 transform transition-all duration-300 scale-100">
              <button
                onClick={closeApplyModal}
                className="absolute right-3 top-3 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Apply for {selectedJob.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to apply for this position?
                </p>
              </div>

              {/* Skill Match Result */}
              {userProfile && (
                <div className="mb-4">
                  <SkillMatchResult
                    candidateSkills={userProfile.skills}
                    jobSkills={selectedJob.skills || []}
                    matchScore={selectedJob.matchScore}
                  />
                  {console.log("UserSkills: " + userProfile.skills)}
                  {console.log("JobSkills: " + selectedJob.skills)}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={closeApplyModal}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Placeholder for real apply flow
                    closeApplyModal();
                    submitApplyForm(selectedJob);
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Confirm Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recruiter Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 md:p-8 shadow-2xl ring-1 ring-gray-200 transform transition-all duration-300 scale-100">
              <button
                onClick={closeDetailsModal}
                className="absolute right-3 top-3 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>

              {detailsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-2/3 rounded bg-gray-200" />
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-24 w-full rounded bg-gray-200" />
                </div>
              ) : selectedRecruiter ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start space-x-4">
                    {selectedRecruiter.company_logo ? (
                      <img
                        src={selectedRecruiter.company_logo}
                        alt={selectedRecruiter.company_name}
                        className="h-14 w-14 rounded-xl object-cover ring-1 ring-gray-200"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                        {selectedRecruiter.company_name?.[0] || "C"}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {selectedRecruiter.company_name}
                        </h3>
                        {selectedRecruiter.is_verified && (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                            <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {selectedRecruiter.industry || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        {selectedRecruiter.location || "—"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="mr-2 h-4 w-4 text-indigo-600" />
                      <span className="text-sm">
                        {selectedRecruiter.phone_number || "—"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Globe className="mr-2 h-4 w-4 text-purple-600" />
                      {selectedRecruiter.company_website ? (
                        <a
                          href={selectedRecruiter.company_website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-indigo-700 hover:underline"
                        >
                          {selectedRecruiter.company_website}
                        </a>
                      ) : (
                        <span className="text-sm">—</span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Linkedin className="mr-2 h-4 w-4 text-blue-700" />
                      {selectedRecruiter.linkedin_url ? (
                        <a
                          href={selectedRecruiter.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-indigo-700 hover:underline"
                        >
                          {selectedRecruiter.linkedin_url}
                        </a>
                      ) : (
                        <span className="text-sm">—</span>
                      )}
                    </div>
                  </div>

                  {/* About */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">
                      About Company
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedRecruiter.company_description || "—"}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={closeDetailsModal}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm text-center">
                  No recruiter details available.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
