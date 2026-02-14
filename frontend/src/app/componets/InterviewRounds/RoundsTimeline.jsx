'use client'

import {
  Calendar,
  MapPin,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import RoundStatusBadge from './RoundStatusBadge'

const STATUS_ICONS = {
  WAITING: Clock,
  ONGOING: AlertCircle,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle
}

export default function RoundsTimeline({
  rounds,
  isReadOnly = true,
  onStatusChange,
  onEdit
}) {
  if (!rounds || rounds.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Interview Rounds Scheduled
        </h3>
        <p className="text-gray-500">
          {isReadOnly
            ? 'Interview rounds will appear here once scheduled by the recruiter.'
            : 'Create your first interview round to get started.'}
        </p>
      </div>
    )
  }

  const completedRounds = rounds.filter(
    (round) => round.status === 'ACCEPTED' || round.status === 'REJECTED'
  ).length

  const progressPercentage =
    rounds.length > 0 ? (completedRounds / rounds.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Application Progress
          </span>
          <span className="text-sm text-gray-500">
            {completedRounds} of {rounds.length} rounds completed
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {rounds.map((round, index) => {
          const StatusIcon = STATUS_ICONS[round.status]
          const isCurrentRound =
            index === completedRounds && round.status === 'WAITING'

          return (
            <div key={round.id} className="relative mb-8 last:mb-0">
              {/* Timeline line */}
              {index < rounds.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
              )}

              <div className="flex items-start space-x-4">
                {/* Timeline dot */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    round.status === 'ACCEPTED'
                      ? 'bg-green-100 border-2 border-green-300'
                      : round.status === 'REJECTED'
                      ? 'bg-red-100 border-2 border-red-300'
                      : round.status === 'ONGOING'
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : isCurrentRound
                      ? 'bg-yellow-100 border-2 border-yellow-300'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  <StatusIcon
                    className={`w-5 h-5 ${
                      round.status === 'ACCEPTED'
                        ? 'text-green-600'
                        : round.status === 'REJECTED'
                        ? 'text-red-600'
                        : round.status === 'ONGOING'
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}
                  />
                </div>

                {/* Round card */}
                <div
                  className={`flex-1 rounded-lg p-4 border shadow-sm ${
                    isCurrentRound
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {round.roundName}
                        </h4>

                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {round.roundType}
                        </span>

                        {isCurrentRound && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            Current Round
                          </span>
                        )}
                      </div>

                      {round.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {round.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {new Date(round.scheduledAt).toLocaleString(
                              'en-US',
                              {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex items-center">
                          {round.mode === 'ONLINE' ? (
                            <Video className="w-4 h-4 mr-2 text-gray-400" />
                          ) : (
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          )}
                          <span className="capitalize">
                            {round.mode.toLowerCase()}
                          </span>
                        </div>
                      </div>

                      {round.locationOrLink && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">
                            {round.mode === 'ONLINE'
                              ? 'Meeting Link: '
                              : 'Location: '}
                          </span>

                          {round.mode === 'ONLINE' ? (
                            <a
                              href={round.locationOrLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              Join Meeting
                            </a>
                          ) : (
                            <span className="text-gray-900">
                              {round.locationOrLink}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <RoundStatusBadge status={round.status} />

                      {!isReadOnly && onEdit && (
                        <button
                          onClick={() => onEdit(round)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Edit
                        </button>
                      )}

                      {!isReadOnly && onStatusChange && (
                        <select
                          value={round.status}
                          onChange={(e) =>
                            onStatusChange(round.id, e.target.value)
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="WAITING">Waiting</option>
                          <option value="ONGOING">Ongoing</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
