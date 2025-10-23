'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import JobSeekerNavbar from '../JobComponents/JobSeekerNavbar';
import {
  User, Mail, Phone, MapPin, Briefcase, Building2, FileText,
  Github, Linkedin, Globe, Edit3, Save, X, CheckCircle, AlertCircle, Upload
} from 'lucide-react';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profilePicture: '',
    headline: '',
    currentCompany: '',
    experienceLevel: '',
    jobTitle: '',
    jobDescription: '',
    skills: [],
    industry: '',
    location: '',
    resume: '',
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        const uid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        setUserId(uid);
        if (!uid) {
          setMessage({ type: 'error', text: 'User not found. Please login again.' });
          setLoading(false);
          return;
        }
        await fetchProfile(uid);
      } catch (err) {
        console.error('Init error:', err);
        setMessage({ type: 'error', text: 'Failed to initialize profile.' });
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (uid) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/userProfile/user/${uid}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = res.data || null;
      setProfile(data);
      setFormData({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        profilePicture: data.profilePicture ?? '',
        headline: data.headline ?? '',
        currentCompany: data.currentCompany ?? '',
        experienceLevel: data.experienceLevel ?? '',
        jobTitle: data.jobTitle ?? '',
        jobDescription: data.jobDescription ?? '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        industry: data.industry ?? '',
        location: data.location ?? '',
        resume: data.resume ?? '',
        linkedinUrl: data.linkedinUrl ?? '',
        portfolioUrl: data.portfolioUrl ?? '',
        githubUrl: data.githubUrl ?? ''
      });
      setEditMode(false);
    } catch (err) {
      // If 404, show create mode
      if (err.response?.status === 404) {
        setProfile(null);
        setEditMode(true);
        setMessage({ type: 'info', text: 'No profile found. Create your profile below.' });
      } else {
        console.error('Fetch profile error:', err);
        setMessage({ type: 'error', text: 'Failed to load profile.' });
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
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        email: profile.email ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        profilePicture: profile.profilePicture ?? '',
        headline: profile.headline ?? '',
        currentCompany: profile.currentCompany ?? '',
        experienceLevel: profile.experienceLevel ?? '',
        jobTitle: profile.jobTitle ?? '',
        jobDescription: profile.jobDescription ?? '',
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        industry: profile.industry ?? '',
        location: profile.location ?? '',
        resume: profile.resume ?? '',
        linkedinUrl: profile.linkedinUrl ?? '',
        portfolioUrl: profile.portfolioUrl ?? '',
        githubUrl: profile.githubUrl ?? ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Skills editor
  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    setFormData((prev) => ({ ...prev, skills: Array.from(new Set([...(prev.skills || []), s])) }));
    setSkillInput('');
  };
  const removeSkill = (skill) => {
    setFormData((prev) => ({ ...prev, skills: (prev.skills || []).filter((x) => x !== skill) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Basic validation examples
    if (!formData.firstName || !formData.lastName) {
      setMessage({ type: 'error', text: 'First and last name are required.' });
      setSaving(false);
      return;
    }
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Email is required.' });
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
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
        setEditMode(false);
      } else {
        // Create new
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/userProfile/create/${userId}`,
          { ...formData },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setProfile(res.data);
        setMessage({ type: 'success', text: 'Profile created successfully.' });
        setEditMode(false);
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = useMemo(() => {
    const base = formData.firstName || profile?.firstName || 'U';
    return (base || 'U').charAt(0).toUpperCase();
  }, [formData.firstName, profile]);

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
                {profile?.firstName || formData.firstName || 'Your'}{' '}
                {profile?.lastName || formData.lastName || 'Name'}
              </h1>
              <p className="text-white/90">
                {profile?.headline || formData.headline || 'Add your headline to stand out'}
              </p>
            </div>
            <div className="ml-auto flex items-center space-x-3">
              {!editMode ? (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-700 font-medium rounded-lg shadow hover:shadow-md transition"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
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
              message.type === 'error'
                ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                : message.type === 'success'
                ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
            }`}
          >
            {message.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : message.type === 'success' ? (
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: About & Contact */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card title="About" icon={FileText}>
                {!editMode ? (
                  <div className="space-y-2 text-gray-700">
                    <p className="text-sm leading-relaxed">
                      {profile?.jobDescription || 'Describe your role and impact.'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <Badge icon={Briefcase} label={profile?.jobTitle || 'Job Title'} />
                      <Badge icon={Building2} label={profile?.currentCompany || 'Current Company'} />
                      <Badge icon={MapPin} label={profile?.location || 'Location'} />
                      <Badge icon={Globe} label={profile?.industry || 'Industry'} />
                      <Badge icon={ClockIcon} label={profile?.experienceLevel || 'Experience'} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Headline" name="headline" value={formData.headline} onChange={handleInputChange} />
                    <Input label="Current Company" name="currentCompany" value={formData.currentCompany} onChange={handleInputChange} />
                    <Input label="Experience Level" name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange} />
                    <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
                    <TextArea label="Job Description" name="jobDescription" value={formData.jobDescription} onChange={handleInputChange} />
                    <Input label="Industry" name="industry" value={formData.industry} onChange={handleInputChange} />
                    <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} />
                  </div>
                )}
              </Card>

              {/* Skills */}
              <Card title="Skills" icon={Briefcase}>
                {!editMode ? (
                  <div className="flex flex-wrap gap-2">
                    {(profile?.skills || []).length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No skills added.</span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a skill"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={addSkill}
                        type="button"
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(formData.skills || []).map((skill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition"
                          title="Click to remove"
                        >
                          {skill} ✕
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Links */}
              <Card title="Links" icon={Globe}>
                {!editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <LinkRow icon={Linkedin} label="LinkedIn" href={profile?.linkedinUrl} />
                    <LinkRow icon={Globe} label="Portfolio" href={profile?.portfolioUrl} />
                    <LinkRow icon={Github} label="GitHub" href={profile?.githubUrl} />
                    <LinkRow icon={FileText} label="Resume" href={profile?.resume} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Profile Picture URL" name="profilePicture" value={formData.profilePicture} onChange={handleInputChange} />
                    <Input label="Resume URL" name="resume" value={formData.resume} onChange={handleInputChange} />
                    <Input label="LinkedIn URL" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} />
                    <Input label="Portfolio URL" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} />
                    <Input label="GitHub URL" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} />
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Contact */}
            <div className="space-y-6">
              <Card title="Contact" icon={Mail}>
                {!editMode ? (
                  <div className="space-y-3 text-gray-700">
                    <Row icon={User} text={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || '—'} />
                    <Row icon={Mail} text={profile?.email || '—'} />
                    <Row icon={Phone} text={profile?.phoneNumber || '—'} />
                    <Row icon={MapPin} text={profile?.location || '—'} />
                    <Row icon={Building2} text={profile?.currentCompany || '—'} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                    <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                    <Input label="Email" name="email" value={formData.email} onChange={handleInputChange} />
                    <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                  </div>
                )}
              </Card>

              {/* Quick Actions */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                    onClick={() => window.open(formData.resume || profile?.resume || '#', '_blank')}
                  >
                    <FileText className="w-4 h-4 text-blue-600" /> View Resume
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                    onClick={() => window.open(formData.linkedinUrl || profile?.linkedinUrl || '#', '_blank')}
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn
                  </button>
                </div>
              </div>
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

function Input({ label, name, value, onChange, type = 'text', placeholder }) {
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
  const valid = !!href && href !== '#';
  return (
    <div className="flex items-center text-gray-700">
      <Icon className="mr-2 h-4 w-4 text-blue-700" />
      {valid ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-sm text-indigo-700 hover:underline">
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
      <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 12h1v4h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}