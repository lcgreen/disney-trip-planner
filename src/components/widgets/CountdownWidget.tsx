'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import WidgetBase, { type WidgetSize } from './WidgetBase'
import { WidgetConfigManager, type SavedCountdown } from '@/lib/widgetConfig'

interface CountdownWidgetProps {
  id: string
  onRemove: () => void
  onSettings?: () => void
}

export default function CountdownWidget({ id, onRemove, onSettings }: CountdownWidgetProps) {
  const [config, setConfig] = useState<{ size: WidgetSize; selectedItemId?: string } | null>(null)
  const [selectedCountdown, setSelectedCountdown] = useState<SavedCountdown | null>(null)
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
      setConfig({ size: widgetConfig.size, selectedItemId: widgetConfig.selectedItemId })
    } else {
      // Default config
      const defaultConfig = { size: 'medium' as WidgetSize, selectedItemId: undefined }
      setConfig(defaultConfig)
      WidgetConfigManager.addConfig({
        id,
        type: 'countdown',
        size: 'medium',
        selectedItemId: undefined,
        settings: {}
      })
    }
  }, [id])

  useEffect(() => {
    // Load selected countdown data
    if (config?.selectedItemId) {
      const countdown = WidgetConfigManager.getSelectedItemData('countdown', config.selectedItemId) as SavedCountdown
      if (countdown) {
        setSelectedCountdown(countdown)
      } else {
        // Selected item not found, fallback to live app state or default
        const currentState = WidgetConfigManager.getCurrentCountdownState()
        if (currentState?.tripDate) {
          const fallbackCountdown: SavedCountdown = {
            id: 'live',
            name: currentState.title || 'My Disney Trip',
            park: currentState.park || { name: 'Disney World' },
            date: currentState.tripDate,
            settings: {},
            createdAt: new Date().toISOString()
          }
          setSelectedCountdown(fallbackCountdown)
        } else {
          setSelectedCountdown(null)
        }
      }
    } else {
      // No item selected, use live app state as fallback
      const currentState = WidgetConfigManager.getCurrentCountdownState()
      if (currentState?.tripDate) {
        const liveCountdown: SavedCountdown = {
          id: 'live',
          name: currentState.title || 'My Disney Trip',
          park: currentState.park || { name: 'Disney World' },
          date: currentState.tripDate,
          settings: {},
          createdAt: new Date().toISOString()
        }
        setSelectedCountdown(liveCountdown)
      } else {
        setSelectedCountdown(null)
      }
    }
  }, [config])

  useEffect(() => {
    if (!selectedCountdown?.date) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(selectedCountdown.date).getTime()
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
  }, [selectedCountdown?.date])

  const handleSizeChange = (newSize: WidgetSize) => {
    WidgetConfigManager.updateConfig(id, { size: newSize })
    setConfig(prev => prev ? { ...prev, size: newSize } : { size: newSize })
  }

  const handleItemSelect = (itemId: string | null) => {
    WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })
    setConfig(prev => prev ? { ...prev, selectedItemId: itemId || undefined } : { size: 'medium', selectedItemId: itemId || undefined })
  }

  if (!config) {
    return <div>Loading...</div>
  }

  const { size } = config

  // Show different layouts based on size
  const renderCountdown = () => {
    if (!selectedCountdown) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Countdown Selected</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a new countdown or select an existing one from settings
          </p>
          <button
            onClick={() => window.location.href = `/countdown/new?widgetId=${id}`}
            className="px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Create New Countdown
          </button>
        </div>
      )
    }

    const formatTime = (value: number) => value.toString().padStart(2, '0')

    // Get park-specific gradient or fallback to default Disney colors
    const parkGradient = selectedCountdown.park?.gradient || 'from-disney-blue to-disney-purple'

    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-center">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-800 mb-1 truncate">{selectedCountdown.name}</h3>
            <p className="text-xs text-gray-500 truncate">
              {selectedCountdown.park?.name} • {new Date(selectedCountdown.date).toLocaleDateString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-3`}>
              <div className="text-lg font-bold">{timeLeft.days}</div>
              <div className="text-xs opacity-90">Days</div>
            </div>
            <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-3`}>
              <div className="text-lg font-bold">{formatTime(timeLeft.hours)}</div>
              <div className="text-xs opacity-90">Hours</div>
            </div>
          </div>
        </div>
      )
    }

    if (size === 'medium') {
      return (
        <div className="h-full flex flex-col justify-center">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedCountdown.name}</h3>
            <p className="text-sm text-gray-600">
              {selectedCountdown.park?.name} • {new Date(selectedCountdown.date).toLocaleDateString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-4`}>
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-sm opacity-90">Days</div>
            </div>
            <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-4`}>
              <div className="text-2xl font-bold">{formatTime(timeLeft.hours)}</div>
              <div className="text-sm opacity-90">Hours</div>
            </div>
          </div>
        </div>
      )
    }

    // Large size - show all units with park-specific colors
    return (
      <div className="h-full flex flex-col justify-center">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{selectedCountdown.name}</h3>
          <p className="text-gray-600">
            {selectedCountdown.park?.name} • {new Date(selectedCountdown.date).toLocaleDateString()}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-4`}>
            <div className="text-2xl font-bold">{timeLeft.days}</div>
            <div className="text-sm opacity-90">Days</div>
          </div>
          <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-4`}>
            <div className="text-2xl font-bold">{formatTime(timeLeft.hours)}</div>
            <div className="text-sm opacity-90">Hours</div>
          </div>
          <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-4`}>
            <div className="text-2xl font-bold">{formatTime(timeLeft.minutes)}</div>
            <div className="text-sm opacity-90">Minutes</div>
          </div>
          <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-4`}>
            <div className="text-2xl font-bold">{formatTime(timeLeft.seconds)}</div>
            <div className="text-sm opacity-90">Seconds</div>
          </div>
        </div>
      </div>
    )
  }

  // Get icon gradient based on selected countdown park
  const getIconGradient = () => {
    if (selectedCountdown?.park?.gradient) {
      return `bg-gradient-to-r ${selectedCountdown.park.gradient}`
    }
    return "bg-gradient-to-r from-disney-blue to-disney-purple"
  }

  return (
    <WidgetBase
      id={id}
      title="Disney Countdown"
      icon={Clock}
      iconColor={getIconGradient()}
      widgetType="countdown"
      size={size}
      selectedItemId={config.selectedItemId}
      onRemove={onRemove}
      onSizeChange={handleSizeChange}
      onItemSelect={handleItemSelect}
    >
      {renderCountdown()}
    </WidgetBase>
  )
}