'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import WidgetBase, { type WidgetSize } from './WidgetBase'
import { PluginRegistry, PluginStorage } from '@/lib/pluginSystem'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import '@/plugins' // Import all plugins to register them

interface CountdownWidgetProps {
  id: string
  width?: string
  onRemove: () => void
  onSettings?: () => void
  onWidthChange?: (width: string) => void
  onItemSelect?: (itemId: string | null) => void
}

export default function CountdownWidget({
  id,
  width,
  onRemove,
  onSettings,
  onWidthChange,
  onItemSelect
}: CountdownWidgetProps) {
  const [selectedCountdown, setSelectedCountdown] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

    useEffect(() => {
    // Load selected countdown data from plugin
    const countdownPlugin = PluginRegistry.getPlugin('countdown')
    if (countdownPlugin) {
      // Get the widget configuration to see if a specific item is selected
      const widgetConfig = WidgetConfigManager.getConfig(id)
      const selectedItemId = widgetConfig?.selectedItemId

      if (selectedItemId) {
        // Load the specific selected countdown
        const countdown = countdownPlugin.getItem(selectedItemId)
        setSelectedCountdown(countdown)
      } else {
        // Load live/default data
        const countdown = countdownPlugin.getWidgetData(id)
        setSelectedCountdown(countdown)
      }
    }
  }, [id])

  // Watch for changes in widget configuration
  useEffect(() => {
    const checkForUpdates = () => {
      const countdownPlugin = PluginRegistry.getPlugin('countdown')
      if (countdownPlugin) {
        const widgetConfig = WidgetConfigManager.getConfig(id)
        const selectedItemId = widgetConfig?.selectedItemId

        if (selectedItemId) {
          const countdown = countdownPlugin.getItem(selectedItemId)
          setSelectedCountdown(countdown)
        } else {
          const countdown = countdownPlugin.getWidgetData(id)
          setSelectedCountdown(countdown)
        }
      }
    }

    // Check immediately
    checkForUpdates()

    // Set up an interval to check for updates
    const interval = setInterval(checkForUpdates, 1000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    if (!selectedCountdown?.tripDate) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(selectedCountdown.tripDate).getTime()
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
  }, [selectedCountdown?.tripDate])

  const handleItemSelect = (itemId: string | null) => {
    // Update the widget configuration
    WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })

    // Call the parent callback if provided
    if (onItemSelect) {
      onItemSelect(itemId)
    }
  }

  // Show different layouts based on width
  const renderCountdown = () => {
    if (!selectedCountdown) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-2">
          <Clock className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-600 mb-1">No Countdown Selected</h3>
          <p className="text-xs text-gray-500 mb-3 max-w-[200px]">
            Create a new countdown or select one from settings
          </p>
          <button
            onClick={() => window.location.href = `/countdown/new?widgetId=${id}`}
            className="px-3 py-1.5 bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
          >
            Create New
          </button>
        </div>
      )
    }

    const formatTime = (value: number) => value.toString().padStart(2, '0')

    // Get park-specific gradient or fallback to default Disney colors
    const parkGradient = selectedCountdown.park?.gradient || 'from-disney-blue to-disney-purple'

    // Determine layout based on width
    const isWide = width === '3' || width === '4'
    const isNarrow = width === '1'

    if (isNarrow) {
      return (
        <div className="h-full flex flex-col justify-center">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-800 mb-1 truncate">{selectedCountdown.name}</h3>
            <p className="text-xs text-gray-500 truncate">
              {selectedCountdown.park?.name} • {new Date(selectedCountdown.tripDate).toLocaleDateString()}
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

    if (isWide) {
      return (
        <div className="h-full flex flex-col justify-center">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{selectedCountdown.name}</h3>
            <p className="text-sm text-gray-600">
              {selectedCountdown.park?.name} • {new Date(selectedCountdown.tripDate).toLocaleDateString()}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-3`}>
              <div className="text-xl font-bold">{timeLeft.days}</div>
              <div className="text-xs opacity-90">Days</div>
            </div>
            <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-3`}>
              <div className="text-xl font-bold">{formatTime(timeLeft.hours)}</div>
              <div className="text-xs opacity-90">Hours</div>
            </div>
            <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-3`}>
              <div className="text-xl font-bold">{formatTime(timeLeft.minutes)}</div>
              <div className="text-xs opacity-90">Minutes</div>
            </div>
            <div className={`bg-gradient-to-r ${parkGradient} text-white rounded-lg p-3`}>
              <div className="text-xl font-bold">{formatTime(timeLeft.seconds)}</div>
              <div className="text-xs opacity-90">Seconds</div>
            </div>
          </div>
        </div>
      )
    }

    // Default layout (2 columns)
    return (
      <div className="h-full flex flex-col justify-center">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedCountdown.name}</h3>
          <p className="text-sm text-gray-600">
            {selectedCountdown.park?.name} • {new Date(selectedCountdown.tripDate).toLocaleDateString()}
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
      size="medium"
      width={width}
      selectedItemId={selectedCountdown?.id}
      onRemove={onRemove}
      onWidthChange={onWidthChange}
      onItemSelect={handleItemSelect}
    >
      {renderCountdown()}
    </WidgetBase>
  )
}