'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, Settings } from 'lucide-react'
import Link from 'next/link'

interface CountdownWidgetProps {
  onRemove?: () => void
  onSettings?: () => void
}

export default function CountdownWidget({ onRemove, onSettings }: CountdownWidgetProps) {
  const [tripDate, setTripDate] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Load saved trip date or set default
    const saved = localStorage.getItem('disney-trip-date')
    if (saved) {
      setTripDate(saved)
    } else {
      // Default to 30 days from now
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)
      setTripDate(defaultDate.toISOString().split('T')[0])
    }
  }, [])

  useEffect(() => {
    if (!tripDate) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(tripDate).getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [tripDate])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 h-full"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-disney-blue to-disney-purple p-2 rounded-lg">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">Disney Countdown</h3>
        </div>

        <div className="flex items-center space-x-1">
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Countdown Display */}
      <div className="text-center mb-3">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gradient-to-br from-disney-blue/10 to-disney-purple/10 rounded-lg p-2">
            <div className="text-xl font-bold text-disney-blue">{timeLeft.days}</div>
            <div className="text-xs text-gray-600">Days</div>
          </div>
          <div className="bg-gradient-to-br from-disney-blue/10 to-disney-purple/10 rounded-lg p-2">
            <div className="text-xl font-bold text-disney-blue">{timeLeft.hours}</div>
            <div className="text-xs text-gray-600">Hours</div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          {timeLeft.minutes}m {timeLeft.seconds}s
        </div>

        {tripDate && (
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{new Date(tripDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Link
          href="/countdown"
          className="w-full bg-gradient-to-r from-disney-blue to-disney-purple text-white text-sm py-2 px-3 rounded-lg hover:shadow-md transition-all duration-200 text-center block"
        >
          View Full Timer
        </Link>
      </div>
    </motion.div>
  )
}