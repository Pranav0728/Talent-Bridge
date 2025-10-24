"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import JobSeekerNavbar from "../JobComponents/JobSeekerNavbar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  FileText,
  Github,
  Linkedin,
  Globe,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react";
import Link from "next/link";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    headline: "",
    currentCompany: "",
    experienceLevel: "",
    jobTitle: "",
    jobDescription: "",
    skills: [],
    industry: "",
    location: "",
    resume: "",
    linkedinUrl: "",
    portfolioUrl: "",
    githubUrl: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const uid =
          typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        setUserId(uid);
        if (!uid) {
          setMessage({
            type: "error",
            text: "User not found. Please login again.",
          });
          setLoading(false);
          return;
        }
        await fetchProfile(uid);
      } catch (err) {
        console.error("Init error:", err);
        setMessage({ type: "error", text: "Failed to initialize profile." });
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (uid) => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/userProfile/user/${uid}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = res.data || null;
      setProfile(data);
      setFormData({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
        profilePicture: data.profilePicture ?? "",
        headline: data.headline ?? "",
        currentCompany: data.currentCompany ?? "",
        experienceLevel: data.experienceLevel ?? "",
        jobTitle: data.jobTitle ?? "",
        jobDescription: data.jobDescription ?? "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        industry: data.industry ?? "",
        location: data.location ?? "",
        resume: data.resume ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        portfolioUrl: data.portfolioUrl ?? "",
        githubUrl: data.githubUrl ?? "",
      });
      setEditMode(false);
    } catch (err) {
      // If 404, show create mode with clean UI
      if (err.response?.status === 404) {
        setProfile(null);
        setEditMode(true);
        setMessage({
          type: "info",
          text: "Welcome! Let's create your professional profile to get started.",
        });
      } else {
        console.error("Fetch profile error:", err);
        setMessage({ type: "error", text: "Failed to load profile." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
    if (!editMode && profile) {
      // entering edit mode ensures form sync
      setFormData({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email: profile.email ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        profilePicture: profile.profilePicture ?? "",
        headline: profile.headline ?? "",
        currentCompany: profile.currentCompany ?? "",
        experienceLevel: profile.experienceLevel ?? "",
        jobTitle: profile.jobTitle ?? "",
        jobDescription: profile.jobDescription ?? "",
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        industry: profile.industry ?? "",
        location: profile.location ?? "",
        resume: profile.resume ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        portfolioUrl: profile.portfolioUrl ?? "",
        githubUrl: profile.githubUrl ?? "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Skills editor
  const [skillInput, setSkillInput] = useState("");
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    setFormData((prev) => ({
      ...prev,
      skills: Array.from(new Set([...(prev.skills || []), s])),
    }));
    setSkillInput("");
  };
  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((x) => x !== skill),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Basic validation examples
    if (!formData.firstName || !formData.lastName) {
      setMessage({ type: "error", text: "First and last name are required." });
      setSaving(false);
      return;
    }
    if (!formData.email) {
      setMessage({ type: "error", text: "Email is required." });
      setSaving(false);
      return;
    }

    try {
      if (profile?.id) {
        // Update existing
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/userProfile/update/${profile.id}`,
          { ...formData },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setProfile(res.data);
        setMessage({ type: "success", text: "Profile updated successfully." });
        setEditMode(false);
      } else {
        // Create new
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/userProfile/create/${userId}`,
          { ...formData },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setProfile(res.data);
        setMessage({ type: "success", text: "Profile created successfully." });
        setEditMode(false);
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage({
        type: "error",
        text: "Failed to save profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = useMemo(() => {
    const base = formData.firstName || profile?.firstName || "U";
    return (base || "U").charAt(0).toUpperCase();
  }, [formData.firstName, profile]);

  // Calculate profile completion percentage
  const profileCompletion = useMemo(() => {
    const fields = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'headline', 
      'currentCompany', 'experienceLevel', 'jobTitle', 'jobDescription',
      'industry', 'location', 'skills', 'resume', 'linkedinUrl'
    ];
    
    const completedFields = fields.filter(field => {
      const value = formData[field];
      return value && value.toString().trim() !== '';
    }).length;
    
    return Math.round((completedFields / fields.length) * 100);
  }, [formData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <JobSeekerNavbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <div className="relative">
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt="Profile"
                  className="w-20 h-20 rounded-xl object-cover shadow-lg ring-2 ring-white/60"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-2 ring-white/60">
                  {avatarLetter}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 text-white">
              <h1 className="text-2xl font-bold">
                {profile?.firstName || formData.firstName || "Welcome"}{" "}
                {profile?.lastName || formData.lastName || ""}
              </h1>
              <p className="text-white/90">
                {profile?.headline ||
                  formData.headline ||
                  (profile ? "Add your headline to stand out" : "Let's build your professional profile")}
              </p>
            </div>
            <div className="ml-auto flex items-center space-x-3">
              {!editMode ? (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-700 font-medium rounded-lg shadow hover:shadow-md transition"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> 
                  {profile ? "Edit Profile" : "Create Profile"}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />{" "}
                    {saving ? "Saving..." : (profile ? "Save Changes" : "Create Profile")}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="inline-flex items-center px-4 py-2 bg-white text-gray-700 font-medium rounded-lg shadow hover:shadow-md transition"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4`}>
          <div
            className={`rounded-lg p-3 flex items-center space-x-2 ${
              message.type === "error"
                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                : message.type === "success"
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : message.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <InfoIcon />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <Skeleton />
        ) : !profile && !editMode ? (
          // No profile and not in edit mode - show create profile prompt
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Create Your Professional Profile
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Build your professional profile to showcase your skills, experience, and connect with opportunities.
              </p>
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <User className="w-5 h-5 mr-2" />
                Get Started
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: About & Contact */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card title="About" icon={FileText}>
                {!editMode ? (
                  <div className="space-y-2 text-gray-700">
                    <p className="text-sm leading-relaxed">
                      {profile?.jobDescription ||
                        "Describe your role and impact."}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <Badge
                        icon={Briefcase}
                        label={profile?.jobTitle || "Job Title"}
                      />
                      <Badge
                        icon={Building2}
                        label={profile?.currentCompany || "Current Company"}
                      />
                      <Badge
                        icon={MapPin}
                        label={profile?.location || "Location"}
                      />
                      <Badge
                        icon={Globe}
                        label={profile?.industry || "Industry"}
                      />
                      <Badge
                        icon={ClockIcon}
                        label={profile?.experienceLevel || "Experience"}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Headline"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      placeholder="e.g., Full Stack Developer | React | Node.js"
                    />
                    <Input
                      label="Current Company"
                      name="currentCompany"
                      value={formData.currentCompany}
                      onChange={handleInputChange}
                      placeholder="e.g., Tech Corp"
                    />
                    <Input
                      label="Experience Level"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      placeholder="e.g., 2-3 years, Senior, etc."
                    />
                    <Input
                      label="Job Title"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Engineer"
                    />
                    <TextArea
                      label="Job Description"
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleInputChange}
                      placeholder="Describe your current role and responsibilities..."
                    />
                    <Input
                      label="Industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                    <Input
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                )}
              </Card>

              {/* Skills */}
              <Card title="Skills" icon={Briefcase}>
                {!editMode ? (
                  <div className="flex flex-wrap gap-2">
                    {(profile?.skills || []).length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Briefcase className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500">
                          No skills added yet.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="e.g., JavaScript, Python, React..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button
                        onClick={addSkill}
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Add Skill
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.skills || []).map((skill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition flex items-center gap-1"
                          title="Click to remove"
                        >
                          {skill} <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                    {(formData.skills || []).length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Add your technical skills, programming languages, tools, and other relevant abilities.
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* Links */}
              <Card title="Links & Portfolio" icon={Globe}>
                {!editMode ? (
                  <div className="space-y-3">
                    <LinkRow
                      icon={Linkedin}
                      label="LinkedIn"
                      href={profile?.linkedinUrl}
                    />
                    <LinkRow
                      icon={Globe}
                      label="Portfolio"
                      href={profile?.portfolioUrl}
                    />
                    <LinkRow
                      icon={Github}
                      label="GitHub"
                      href={profile?.githubUrl}
                    />
                    <LinkRow
                      icon={FileText}
                      label="Resume"
                      href={profile?.resume}
                    />
                    {!profile?.linkedinUrl && !profile?.portfolioUrl && !profile?.githubUrl && !profile?.resume && (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Globe className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500">
                          No links added yet.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Profile Picture URL"
                        name="profilePicture"
                        value={formData.profilePicture}
                        onChange={handleInputChange}
                        placeholder="https://example.com/photo.jpg"
                      />
                      <Input
                        label="Resume URL"
                        name="resume"
                        value={formData.resume}
                        onChange={handleInputChange}
                        placeholder="https://example.com/resume.pdf"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="LinkedIn URL"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/yourname"
                      />
                      <Input
                        label="Portfolio URL"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <Input
                      label="GitHub URL"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/yourusername"
                    />
                    <p className="text-sm text-gray-500">
                      Add your professional links to showcase your work and connect with opportunities.
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Contact */}
            <div className="space-y-6">
              <Card title="Contact Information" icon={Mail}>
                {!editMode ? (
                  <div className="space-y-3 text-gray-700">
                    <Row
                      icon={User}
                      text={
                        `${profile?.firstName || ""} ${
                          profile?.lastName || ""
                        }`.trim() || "—"
                      }
                    />
                    <Row icon={Mail} text={profile?.email || "—"} />
                    <Row icon={Phone} text={profile?.phoneNumber || "—"} />
                    <Row icon={MapPin} text={profile?.location || "—"} />
                    <Row
                      icon={Building2}
                      text={profile?.currentCompany || "—"}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name *"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                      />
                      <Input
                        label="Last Name *"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                      />
                    </div>
                    <Input
                      label="Email Address *"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                      placeholder="john.doe@example.com"
                    />
                    <Input
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                    <p className="text-sm text-gray-500">
                      * Required fields
                    </p>
                  </div>
                )}
              </Card>

              {/* Quick Actions */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                    onClick={() =>
                      window.open(
                        formData.resume || profile?.resume || "#",
                        "_blank"
                      )
                    }
                    disabled={!formData.resume && !profile?.resume}
                  >
                    <FileText className="w-4 h-4 text-blue-600" /> 
                    {formData.resume || profile?.resume ? "View Resume" : "No Resume"}
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                    onClick={() =>
                      window.open(
                        formData.linkedinUrl || profile?.linkedinUrl || "#",
                        "_blank"
                      )
                    }
                    disabled={!formData.linkedinUrl && !profile?.linkedinUrl}
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" /> 
                    {formData.linkedinUrl || profile?.linkedinUrl ? "LinkedIn" : "No LinkedIn"}
                  </button>
                  {!profile && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700 text-center">
                        Complete your profile to unlock all features
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Link href="/jobseeker/applications">
              <button
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="font-semibold">View Applications</span>
                  <svg
                    className="h-5 w-5 opacity-90 transition group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
                </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* UI helpers */
function Card({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="ml-3 text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange, rows = 4 }) {
  return (
    <div className="flex flex-col md:col-span-2">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        rows={rows}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Row({ icon: Icon, text }) {
  return (
    <div className="flex items-center">
      <Icon className="w-4 h-4 text-blue-600 mr-2" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function Badge({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
      <Icon className="w-3 h-3 mr-1 text-gray-600" /> {label}
    </span>
  );
}

function LinkRow({ icon: Icon, label, href }) {
  const valid = !!href && href !== "#";
  return (
    <div className="flex items-center text-gray-700">
      <Icon className="mr-2 h-4 w-4 text-blue-700" />
      {valid ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-indigo-700 hover:underline"
        >
          {href}
        </a>
      ) : (
        <span className="text-sm">—</span>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl h-40 bg-gray-200" />
            <div className="rounded-xl h-32 bg-gray-200" />
            <div className="rounded-xl h-24 bg-gray-200" />
          </div>
          <div className="space-y-6">
            <div className="rounded-xl h-32 bg-gray-200" />
            <div className="rounded-xl h-24 bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 8h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 12h1v4h-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
