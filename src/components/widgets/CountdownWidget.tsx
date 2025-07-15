'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import WidgetBase, { WidgetSize } from './WidgetBase'

interface CountdownWidgetProps {
  size?: WidgetSize
  onRemove?: () => void
  onSettings?: () => void
  onSizeChange?: (size: WidgetSize) => void
}

export default function CountdownWidget({ size = 'medium', onRemove, onSettings, onSizeChange }: CountdownWidgetProps) {
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
    <WidgetBase
      id="countdown"
      title="Disney Countdown"
      icon={Clock}
      iconColor="bg-gradient-to-br from-disney-blue to-disney-purple"
      size={size}
      onRemove={onRemove}
      onSettings={onSettings}
      onSizeChange={onSizeChange}
    >
      {/* Countdown Display */}
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-4">
            <div className={`grid gap-3 mb-4 ${size === 'large' ? 'grid-cols-4' : 'grid-cols-2'}`}>
              <div className="bg-gradient-to-br from-disney-blue/10 to-disney-purple/10 rounded-lg p-3">
                <div className={`font-bold text-disney-blue ${size === 'large' ? 'text-3xl' : size === 'small' ? 'text-lg' : 'text-xl'}`}>
                  {timeLeft.days}
                </div>
                <div className="text-xs text-gray-600">Days</div>
              </div>
              <div className="bg-gradient-to-br from-disney-blue/10 to-disney-purple/10 rounded-lg p-3">
                <div className={`font-bold text-disney-blue ${size === 'large' ? 'text-3xl' : size === 'small' ? 'text-lg' : 'text-xl'}`}>
                  {timeLeft.hours}
                </div>
                <div className="text-xs text-gray-600">Hours</div>
              </div>
              {size === 'large' && (
                <>
                  <div className="bg-gradient-to-br from-disney-blue/10 to-disney-purple/10 rounded-lg p-3">
                    <div className="text-3xl font-bold text-disney-blue">{timeLeft.minutes}</div>
                    <div className="text-xs text-gray-600">Minutes</div>
                  </div>
                  <div className="bg-gradient-to-br from-disney-blue/10 to-disney-purple/10 rounded-lg p-3">
                    <div className="text-3xl font-bold text-disney-blue">{timeLeft.seconds}</div>
                    <div className="text-xs text-gray-600">Seconds</div>
                  </div>
                </>
              )}
            </div>

            {size !== 'large' && (
              <div className="text-sm text-gray-600 mb-3">
                {timeLeft.minutes}m {timeLeft.seconds}s
              </div>
            )}

            {tripDate && (
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(tripDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-auto">
          <Link
            href="/countdown"
            className="w-full bg-gradient-to-r from-disney-blue to-disney-purple text-white text-sm py-2 px-3 rounded-lg hover:shadow-md transition-all duration-200 text-center block"
          >
            View Full Timer
          </Link>
        </div>
      </div>
    </WidgetBase>
  )
}