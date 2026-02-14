'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Video, X, Save } from 'lucide-react'

const ROUND_TYPES = [
  { value: 'SCREENING', label: 'Screening' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'MANAGERIAL', label: 'Managerial' },
  { value: 'HR', label: 'HR' },
  { value: 'CUSTOM', label: 'Custom' }
]

const INTERVIEW_MODES = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' }
]

export default function RoundForm({
  round,
  onSubmit,
  onCancel,
  jobId,
  candidateId
}) {
  const [formData, setFormData] = useState({
    roundName: '',
    roundType: 'SCREENING',
    description: '',
    scheduledAt: '',
    mode: 'ONLINE',
    locationOrLink: '',
    jobId: jobId || '',
    candidateId: candidateId || ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (round) {
      setFormData({
        roundName: round.roundName || '',
        roundType: round.roundType || 'SCREENING',
        description: round.description || '',
        scheduledAt: round.scheduledAt
          ? new Date(round.scheduledAt).toISOString().slice(0, 16)
          : '',
        mode: round.mode || 'ONLINE',
        locationOrLink: round.locationOrLink || '',
        jobId: round.jobId || jobId || '',
        candidateId: round.candidateId || candidateId || ''
      })
    }
  }, [round, jobId, candidateId])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.roundName.trim()) {
      newErrors.roundName = 'Round name is required'
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Scheduled date and time is required'
    } else {
      const scheduledDate = new Date(formData.scheduledAt)
      const now = new Date()
      if (scheduledDate <= now) {
        newErrors.scheduledAt = 'Scheduled time must be in the future'
      }
    }

    if (
      formData.mode === 'OFFLINE' &&
      !formData.locationOrLink.trim()
    ) {
      newErrors.locationOrLink =
        'Location is required for offline interviews'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Format date for backend LocalDateTime - send as ISO string without timezone conversion
      const formattedData = {
        ...formData,
        scheduledAt: formData.scheduledAt ? formData.scheduledAt : null
      }
      
      console.log('📝 Form data before formatting:', formData)
      console.log('📝 Formatted data being submitted:', formattedData)
      console.log('📝 Round type value:', formattedData.roundType)
      console.log('📝 Interview mode value:', formattedData.mode)
      console.log('📝 Scheduled at value:', formattedData.scheduledAt)
      
      await onSubmit(formattedData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto"
    >
          {/* Round Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Round Name *
            </label>
            <input
              type="text"
              value={formData.roundName}
              onChange={(e) =>
                handleChange('roundName', e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                errors.roundName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g. Technical Interview"
            />
            {errors.roundName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.roundName}
              </p>
            )}
          </div>

          {/* Round Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Round Type *
            </label>
            <select
              value={formData.roundType}
              onChange={(e) =>
                handleChange('roundType', e.target.value)
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {ROUND_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                handleChange('description', e.target.value)
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) =>
                handleChange('scheduledAt', e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                errors.scheduledAt
                  ? 'border-red-300'
                  : 'border-gray-300'
              }`}
            />
            {errors.scheduledAt && (
              <p className="text-sm text-red-600 mt-1">
                {errors.scheduledAt}
              </p>
            )}
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Interview Mode *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {INTERVIEW_MODES.map((mode) => (
                <label
                  key={mode.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    formData.mode === mode.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={mode.value}
                    checked={formData.mode === mode.value}
                    onChange={(e) =>
                      handleChange('mode', e.target.value)
                    }
                  />
                  {mode.value === 'ONLINE' ? (
                    <Video className="w-5 h-5 mr-2" />
                  ) : (
                    <MapPin className="w-5 h-5 mr-2" />
                  )}
                  {mode.label}
                </label>
              ))}
            </div>
          </div>

          {/* Location / Link */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {formData.mode === 'ONLINE'
                ? 'Meeting Link'
                : 'Location'}
              {formData.mode === 'OFFLINE' && ' *'}
            </label>
            <input
              type="text"
              value={formData.locationOrLink}
              onChange={(e) =>
                handleChange('locationOrLink', e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                errors.locationOrLink
                  ? 'border-red-300'
                  : 'border-gray-300'
              }`}
            />
            {errors.locationOrLink && (
              <p className="text-sm text-red-600 mt-1">
                {errors.locationOrLink}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border px-4 py-3 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {round ? 'Update Round' : 'Create Round'}
            </button>
          </div>
        </form>
  )
}
