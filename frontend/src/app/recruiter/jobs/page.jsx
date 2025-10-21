"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
} from "lucide-react";
import RecruiterNavbar from "../RecruiterComponents/RecruiterNavbar";

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    location: "",
    job_type: "",
    salary: "",
  });

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const [recruiterId, setRecruiterId] = useState(null);
  const fetchRecruiterId = async () => {
    console.log("userId", userId);
    if (!userId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/recruiters/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRecruiterId(response.data.recruiterId);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to get recruiter ID" });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecruiterId(); // first get recruiterId
    } else {
      setMessage({
        type: "error",
        text: "Please login to access job management",
      });
      setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    if (recruiterId) {
      fetchJobs();
    }
  }, [recruiterId]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log("recruiterId", recruiterId);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/jobs/recruiter/${recruiterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setJobs(response.data || []);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load jobs" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recruiterId) {
      setMessage({ type: "error", text: "Recruiter ID not found" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        jobTitle: formData.jobTitle,
        description: formData.description,
        location: formData.location,
        job_type: formData.job_type,
        salary: formData.salary ? parseFloat(formData.salary) : null,
      };

      if (editingJob) {
        await axios.put(
          `http://localhost:8080/jobs/${editingJob.jobId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessage({ type: "success", text: "Job updated successfully!" });
      } else {
        await axios.post(`http://localhost:8080/jobs/${recruiterId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage({ type: "success", text: "Job posted successfully!" });
      }

      resetForm();
      fetchJobs();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save job. Please try again.",
      });
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      jobTitle: job.jobTitle || job.job_title || "",
      description: job.description || "",
      location: job.location || "",
      job_type: job.job_type || "",
      salary: job.salary || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage({ type: "success", text: "Job deleted successfully!" });
        fetchJobs();
      } catch (error) {
        setMessage({ type: "error", text: "Failed to delete job." });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      description: "",
      location: "",
      job_type: "",
      salary: "",
    });
    setEditingJob(null);
    setShowForm(false);
  };

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    return `${Number(salary).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecruiterNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  console.log(jobs);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <RecruiterNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Job Management
              </h1>
              <p className="text-gray-600">
                Create and manage your job postings
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post New Job
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Job Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingJob ? "Edit Job" : "Post New Job"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Java Developer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the job responsibilities, requirements, and benefits..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type *
                    </label>
                    <select
                      name="job_type"
                      value={formData.job_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Job Type</option>
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary (Annual)
                    </label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="600000"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pune, India"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {editingJob ? "Update Job" : "Post Job"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs posted yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by posting your first job
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.jobId}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Company Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {job.recruiter?.company_name}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {job.recruiter?.industry}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="bg-green-600 bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.jobId)}
                        className="bg-red-600 bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.jobTitle ||
                        job.job_title ||
                        "Job Title Not Specified"}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {job.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {formatSalary(job.salary)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {job.job_type || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Posted on {formatDate(job.created_at)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.recruiter?.company_website && (
                        <a
                          href={job.recruiter.company_website
                            .replace(/`/g, "")
                            .trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Company Website
                        </a>
                      )}
                      {job.recruiter?.linkedin_url && (
                        <a
                          href={job.recruiter.linkedin_url
                            .replace(/`/g, "")
                            .trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
