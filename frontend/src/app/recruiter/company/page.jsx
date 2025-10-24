'use client';

import React, { useState, useEffect } from 'react';
import RecruiterNavbar from '../RecruiterComponents/RecruiterNavbar';
import { Building2, Globe, Calendar, MapPin, Phone, Linkedin, Edit3, Save, X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function CompanyProfilePage() {
  const [companyData, setCompanyData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userId, setUserId] = useState(null);

  // Industries list for dropdown
  const industries = [
    'Information Technology', 'Healthcare', 'Finance', 'Education', 
    'Manufacturing', 'Retail', 'Consulting', 'Marketing', 
    'Engineering', 'Telecommunications', 'Real Estate', 'Other'
  ];
  useEffect(() => {
    // Get userId from localStorage
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        setUserId(userId);
        fetchCompanyData(userId);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setMessage({ type: 'error', text: 'Error loading user data' });
        setLoading(false);
      }
    } else {
      setMessage({ type: 'error', text: 'User not found. Please login again.' });
      setLoading(false);
    }
  }, []);

  const fetchCompanyData = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      console.log(userId)
      const response = await axios.get(`http://localhost:8080/api/recruiters/user/${userId}`,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
      );
      if (response.data) {
        setCompanyData(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No company profile exists yet, show empty form
        setCompanyData(null);
        setFormData({
          company_name: '',
          company_description: '',
          company_website: '',
          company_logo: '',
          industry: '',
          established_year: '',
          location: '',
          phone_number: '',
          linkedin_url: '',
          is_verified: false
        });
        setIsEditing(true);
      } else {
        console.error('Error fetching company data:', error);
        setMessage({ type: 'error', text: 'Failed to load company data' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setMessage({ type: 'error', text: 'User ID not found' });
      return;
    }

    try {
        const token = localStorage.getItem('token');
      setSaving(true);
      const payload = {
        userId: userId,
        ...formData,
        established_year: parseInt(formData.established_year) || null
      };

      const response = await axios.post('http://localhost:8080/api/recruiters', payload,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
      );
      
      if (response.data) {
        setCompanyData(response.data);
        setFormData(response.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: companyData ? 'Company profile updated successfully!' : 'Company profile created successfully!' });
      }
    } catch (error) {
      console.error('Error saving company data:', error);
      setMessage({ type: 'error', text: 'Failed to save company data. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(companyData || {
      company_name: '',
      company_description: '',
      company_website: '',
      company_logo: '',
      industry: '',
      established_year: '',
      location: '',
      phone_number: '',
      linkedin_url: '',
      is_verified: false
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <RecruiterNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
          <p className="text-gray-600">Manage your company information and branding</p>
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

        {/* Company Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Company Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {companyData?.company_name || 'Your Company Name'}
                </h2>
                <p className="text-blue-100">
                  {companyData?.industry || 'Industry not specified'}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Company Details */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      name="industry"
                      value={formData.industry || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      name="established_year"
                      value={formData.established_year || ''}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2018"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Pune, Maharashtra, India"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <input
                      type="url"
                      name="company_website"
                      value={formData.company_website || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.talentbridge.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/company/talentbridge"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo URL
                    </label>
                    <input
                      type="url"
                      name="company_logo"
                      value={formData.company_logo || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                {/* Company Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Description
                  </label>
                  <textarea
                    name="company_description"
                    value={formData.company_description || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your company..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {companyData ? 'Update Profile' : 'Create Profile'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Established</p>
                      <p className="text-gray-900">{companyData?.established_year || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{companyData?.location || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-900">{companyData?.phone_number || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Website</p>
                      {companyData?.company_website ? (
                        <a 
                          href={companyData.company_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {companyData.company_website}
                        </a>
                      ) : (
                        <p className="text-gray-900">Not specified</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-start space-x-3">
                  <Linkedin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                    {companyData?.linkedin_url ? (
                      <a 
                        href={companyData.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {companyData.linkedin_url}
                      </a>
                    ) : (
                      <p className="text-gray-900">Not specified</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {companyData?.company_description && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About Company</h3>
                    <p className="text-gray-700 leading-relaxed">{companyData.company_description}</p>
                  </div>
                )}

                {/* Verification Status */}
                {/* <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {companyData?.is_verified ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">Verified Company</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-600 font-medium">Not Verified</span>
                      </>
                    )}
                  </div>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}