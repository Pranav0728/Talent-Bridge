'use client'

import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  WAITING: {
    label: 'Waiting',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  ONGOING: {
    label: 'Ongoing', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  }
}

export default function RoundStatusBadge({ status, size = 'sm', showIcon = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.WAITING
  const Icon = config.icon
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}>
      {showIcon && <Icon className="mr-1.5" size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      {config.label}
    </span>
  )
}