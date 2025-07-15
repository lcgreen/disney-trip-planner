'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import WidgetBase, { WidgetSize } from './WidgetBase'
import { WidgetConfigManager } from '@/lib/widgetConfig'

interface CountdownWidgetProps {
  id: string
  onRemove?: () => void
  onSettings?: () => void
}

export default function CountdownWidget({ id, onRemove, onSettings }: CountdownWidgetProps) {
  const [config, setConfig] = useState<{ size: WidgetSize } | null>(null)
  const [tripDate, setTripDate] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Load widget config
    const widgetConfig = WidgetConfigManager.getConfig(id)
    if (widgetConfig) {
      setConfig({ size: widgetConfig.size })
    } else {
      // Default config
      const defaultConfig = { size: 'medium' as WidgetSize }
      setConfig(defaultConfig)
      WidgetConfigManager.addConfig({
        id,
        type: 'countdown',
        size: 'medium',
        settings: {}
      })
    }

    // Load saved trip date
    const countdownData = WidgetConfigManager.getCountdownData()
    if (countdownData?.tripDate) {
      setTripDate(countdownData.tripDate)
    }
  }, [id])

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

    const handleSizeChange = (newSize: WidgetSize) => {
    WidgetConfigManager.updateConfig(id, { size: newSize })
    setConfig(prev => prev ? { ...prev, size: newSize } : { size: newSize })
  }

  if (!config) {
    return <div>Loading...</div>
  }

  if (!tripDate) {
    return (
      <WidgetBase
        id={id}
        title="Disney Countdown"
        icon={Clock}
        iconColor="bg-gradient-to-br from-disney-blue to-disney-purple"
        size={config.size}
        onRemove={onRemove}
        onSettings={onSettings}
        onSizeChange={handleSizeChange}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Trip Date Set
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            Set your Disney trip date to start counting down to the magic!
          </p>
          <Link
            href="/countdown"
            className="bg-gradient-to-r from-disney-blue to-disney-purple text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200"
          >
            Set Trip Date
          </Link>
        </div>
      </WidgetBase>
    )
  }

  return (
    <WidgetBase
      id={id}
      title="Disney Countdown"
      icon={Clock}
      iconColor="bg-gradient-to-br from-disney-blue to-disney-purple"
      size={config.size}
      onRemove={onRemove}
      onSettings={onSettings}
      onSizeChange={handleSizeChange}
    >
      {/* Countdown Display */}
      <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-4">
            <div className={`grid gap-3 mb-4 ${config.size === 'large' ? 'grid-cols-4' : 'grid-cols-2'}`}>
              <div className="bg-gradient-to-br from-disney-blue/10 to-disney-purple/10 rounded-lg p-3">
                <div className={`font-bold text-disney-blue ${config.size === 'large' ? 'text-3xl' : config.size === 'small' ? 'text-lg' : 'text-xl'}`}>
                  {timeLeft.days}
                </div>
                <div className="text-xs text-gray-600">Days</div>
              </div>
              <div className="bg-gradient-to-br from-disney-blue/10 to-disney-purple/10 rounded-lg p-3">
                <div className={`font-bold text-disney-blue ${config.size === 'large' ? 'text-3xl' : config.size === 'small' ? 'text-lg' : 'text-xl'}`}>
                  {timeLeft.hours}
                </div>
                <div className="text-xs text-gray-600">Hours</div>
              </div>
              {config.size === 'large' && (
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

            {config.size !== 'large' && (
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